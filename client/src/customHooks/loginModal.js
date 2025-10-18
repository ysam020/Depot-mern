import { useState } from "react";

function useLoginModal() {
  const [openModal, setOpenModal] = useState(false);
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  return { openModal, setOpenModal, handleOpenModal, handleCloseModal };
}

export default useLoginModal;
