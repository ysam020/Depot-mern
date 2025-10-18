import { useState } from "react";

function useNavbarMenu() {
  const [anchorElUser, setAnchorElUser] = useState(null);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  return {
    anchorElUser,
    setAnchorElUser,
    handleOpenUserMenu,
    handleCloseUserMenu,
  };
}

export default useNavbarMenu;
