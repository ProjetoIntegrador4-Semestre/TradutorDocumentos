import { styled } from "@mui/material/styles";
import Switch from "@mui/material/Switch";

const ThemeSwitchNeumorphic = styled(Switch)(({    }) => ({
  width: 60,
  height: 33,
  padding: 4,
  "& .MuiSwitch-switchBase": {
    padding: 4.2,
    "&.Mui-checked": {
      transform: "translateX(28px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "#2ECC71",
        boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.2), inset -2px -2px 5px rgba(255,255,255,0.6)",
      },
    },
  },
  "& .MuiSwitch-thumb": {
    backgroundColor: "#fff",
    width: 24.5,
    height: 24.5,
    borderRadius: "50%",
    boxShadow: "0 3px 6px rgba(0,0,0,0.25)",
  },
  "& .MuiSwitch-track": {
    borderRadius: 20,
    backgroundColor: "#DADDE1",
    boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.1), inset -2px -2px 5px rgba(255,255,255,0.7)",
  },
}));
export default ThemeSwitchNeumorphic;
