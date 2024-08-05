"use client";

import Button from "@mui/material/Button";
import { useRouter, usePathname } from "next/navigation";
import { getRecentAvailableDate } from "@/app/actions/records";

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        padding: "10px",
        justifyContent: "flex-end",
        margin: 0, // Remove any extra margin
        paddingTop: 0, // Remove extra top padding if needed
      }}
    >
      <Button
        variant="contained"
        sx={{
          backgroundColor: pathname === "/" ? "#1976d2" : "#9e9e9e",
          color: "white",
          borderColor: pathname === "/" ? "#115293" : "#6d6d6d",
          "&:hover": {
            backgroundColor: pathname === "/" ? "#115293" : "#bdbdbd",
          },
          transition: "background-color 0.3s ease, border-color 0.3s ease",
        }}
        onClick={() => handleNavigation("/")}
      >
        Home
      </Button>
      <Button
        variant="contained"
        sx={{
          backgroundColor: pathname.includes("/dashboard")
            ? "#1976d2"
            : "#9e9e9e",
          color: "white",
          borderColor: pathname.includes("/dashboard") ? "#115293" : "#6d6d6d",
          "&:hover": {
            backgroundColor: pathname.includes("/dashboard")
              ? "#115293"
              : "#bdbdbd",
          },
          transition: "background-color 0.3s ease, border-color 0.3s ease",
        }}
        onClick={async () => {
          let date = await getRecentAvailableDate();
          date = date.replace(/\//g, "-");
          handleNavigation(`/dashboard/${date}`);
        }}
      >
        Dashboard
      </Button>
    </div>
  );
};

export default Header;
