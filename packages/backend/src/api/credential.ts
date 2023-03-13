import { IIdentifier, ProofFormat, ProofType, VerifiableCredential, VerifiablePresentation } from '@veramo/core'
import express, { NextFunction } from 'express'
import { getAgent, setupAgent } from './../veramo/setup'
import * as middlewares from './../middlewares'
import NodeCache from 'node-cache'
import crypto from 'crypto';
import { createBrotliDecompress } from 'zlib'
import jwt_decode from "jwt-decode"
import e from 'express'

const router = express.Router()

const cache = new NodeCache()

type CredentialResponse = string[]

router.use(middlewares.init)
router.post('/register/', async (req, res) => {
  console.log('body' + JSON.stringify(req.body))

  let agent = await getAgent()
  let identifier = await agent.didManagerCreate({
    kms: 'local',
    provider: 'did:pkh',
    options: { network: 'eip155', chainId: '1' },
  })
  const credential = await agent.createVerifiableCredential({
    proofFormat: 'jwt',
    credential: {
      credentialSubject: {
        id: req.body.identifier,
        loginName: req.body.loginName,
      },
      type: ['SiteLoginCredential'],
      issuer: identifier.did,
    },
  })

  console.log(JSON.stringify(credential))
  res.json(credential)
})


router.post('/challenge', async (req, res) => {
  console.log('did:' + JSON.stringify(req.body.did))
  let nonce = crypto.randomBytes(16).toString('base64');

  // set nounce on cache with ttl = 60s
  cache.set(req.body.did as string, nonce, 60);
  res.json({
    challenge: nonce
  })
}) 

router.post('/signIn', async (req, res) => {
  console.log('presentation:' + JSON.stringify(req.body.presentation))
  let agent = await getAgent()

  let verifiablePresentation: VerifiablePresentation = req.body
    .presentation as VerifiablePresentation

  // check challenge
    let a: any = jwt_decode(verifiablePresentation['proof']['jwt']);
  let did = a['iss'];
  let cachedNonce = cache.get(did);
  
  if (cachedNonce === undefined || cachedNonce !== verifiablePresentation["nonce"]) 
  {
    res.json({verified: false, message: "Invalid Nonce"});
  } 

  // We verify the presentation is signed by the user
  let verified = await agent.verifyPresentation({
    presentation: verifiablePresentation,
  })

  if (verified){
    if (verifiablePresentation.verifiableCredential?.length !== 1) {
      res.json({verified: false, message: "Invalid Presentation: we are expecting a single credential"});
    }

    let credential: VerifiableCredential = verifiablePresentation.verifiableCredential?.pop() as VerifiableCredential;
    if (!credential.type?.includes("SiteLoginCredential")){
      res.json({verified: false, message: "Invalid Credential: we are expecting a credential with type SiteLoginCredential"});
    }


    let verificationResponse = null;
    try {
      verificationResponse = await agent.verifyCredential({ credential });
      console.log(verificationResponse.error?.message);
    } catch(e){
      res.sendStatus(500).json({verified: false, message: e});
    }

    if (!verificationResponse?.verified){
      res.json({verified: false, message: `Invalid Credential: ${verificationResponse?.error?.message}`});
    } else {
      res.json({ verified: true});
    }
  } 
})

export default router

