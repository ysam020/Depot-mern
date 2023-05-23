import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import FavoriteIcon from "@mui/icons-material/Favorite";
import Badge from "@mui/material/Badge";
import { Link } from "react-router-dom";
import Login from "./Login";
import useNavbarSettings from "../customHooks/navbarSettings";
import useLoginModal from "../customHooks/loginModal";
import useNavbarMenu from "../customHooks/navbarMenu";
import useSelectors from "../customHooks/useSelectors";

export default function Navbar() {
  const { name, email, cartData, wishlistData } = useSelectors();
  const settings = useNavbarSettings();
  const { openModal, handleOpenModal, handleCloseModal } = useLoginModal();
  const { anchorElUser, handleOpenUserMenu, handleCloseUserMenu } =
    useNavbarMenu();

  return (
    <>
      <AppBar
        sx={{
          backgroundColor: "#fff !important",
          color: "#000 !important",
          boxShadow: "0 2px 12px 0 rgb(36 50 66 / 8%)",
          "& a:hover": { color: "#000 !important" },
        }}
      >
        <Toolbar>
          {/* Desktop logo */}
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            <Link to="/">
              <Typography
                variant="h5"
                noWrap
                sx={{
                  mr: 2,
                  display: { md: "flex", xs: "none" },
                  flexGrow: 1,
                }}
              >
                <img
                  src={require("../assets/images/logo.png")}
                  alt="logo"
                  width={100}
                />
              </Typography>
            </Link>
          </Box>

          {/* Desktop icons */}
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "none", md: "flex" },
              justifyContent: "end",
              alignItems: "center",
              paddingRight: "20px",
            }}
          >
            <IconButton
              aria-label="menu-wishlist"
              sx={{ marginLeft: "10px" }}
              disableRipple
            >
              <Link to="/wishlist" className="navbar-link">
                <Badge
                  badgeContent={wishlistData.wishlist.length}
                  showZero
                  color="primary"
                >
                  <FavoriteIcon
                    sx={{
                      color: "#F15C6D",
                      width: "30px !important",
                      height: "30px !important",
                    }}
                  />
                </Badge>
              </Link>
            </IconButton>

            <IconButton
              aria-label="menu-cart"
              sx={{ marginLeft: "10px" }}
              disableRipple
            >
              <Link to="/cart" className="navbar-link">
                <Badge
                  badgeContent={cartData.cart.length}
                  showZero
                  color="primary"
                >
                  <LocalMallIcon
                    sx={{
                      color: "#000",
                      width: "30px !important",
                      height: "30px !important",
                    }}
                  />
                </Badge>
              </Link>
            </IconButton>
          </Box>

          {/* Mobile logo */}
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <Link to="/">
              <Typography
                variant="h5"
                noWrap
                sx={{
                  mr: 2,
                  display: { xs: "flex", md: "none" },
                  flexGrow: 1,
                }}
              >
                <img
                  src={require("../assets/images/logo.png")}
                  alt="logo"
                  width={100}
                />
              </Typography>
            </Link>
          </Box>

          {/* Avatar */}
          <Box sx={{ flexGrow: 0, display: "flex", alignItems: "center" }}>
            {name && (
              <p style={{ marginBottom: 0, marginRight: "10px" }}>{`Hi, ${
                name.split(" ")[0]
              }`}</p>
            )}
            <IconButton
              onClick={(e) =>
                email ? handleOpenUserMenu(e) : handleOpenModal()
              }
              sx={{ p: 0 }}
              aria-label="menu-user"
            >
              <Avatar alt={email} src="/static/images/avatar/2.jpg" />
            </IconButton>
          </Box>

          {/* User menu */}
          <Menu
            sx={{ mt: "45px" }}
            id="menu-appbar"
            anchorEl={anchorElUser}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            {settings.map((setting, id) => (
              <MenuItem key={id} onClick={handleCloseUserMenu}>
                <Typography textAlign="center" onClick={setting.onClick}>
                  {setting.name}
                </Typography>
              </MenuItem>
            ))}
          </Menu>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Container>
        <Box sx={{ my: 2 }}></Box>
      </Container>

      <Login openModal={openModal} handleCloseModal={handleCloseModal} />
    </>
  );
}
