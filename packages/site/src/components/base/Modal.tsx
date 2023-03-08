import { useCallback, useContext } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { ModalContext } from '../../contexts/ModalContext';

const CustomModal = () => {
  const { show, setShow, modalData } = useContext(ModalContext);

  const handleClose = useCallback(() => setShow(false), [setShow]);

  return (
    <Modal show={show} onHide={handleClose} animation={false}>
      <Modal.Header closeButton>
        <Modal.Title>{modalData?.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{modalData?.content}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export { CustomModal as Modal };
