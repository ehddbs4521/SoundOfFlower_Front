import axios from "axios";
import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { useAuth } from "../AuthProvider";
import Layout from "../components/layouts/Layout";
import Join from "../pages/Member/Join";
import Login from "../pages/Member/Login";
import LoginRedirectPage from "../pages/Member/LoginRedirectPage";
import WriteDiary from "../pages/diary/diary";
import DiaryCalender from "../pages/diarycalender/DiaryCalender";
import GuestMain from "../pages/mainpage/GuestMain";
import Mypage from "../pages/mypage/Mypage";

function Router() {
  const { isLoggedIn } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="/Login" element={<Login />} />
        <Route path="/Join" element={<Join />} />
        <Route path="/login-success" element={<LoginRedirectPage />} />
        <Route path="/WriteDiary" element={<WriteDiary />} />
        <Route path="/mypage" element={<Mypage />} />
        {isLoggedIn ? (
          <Route path="/" element={<DiaryCalender />} />
        ) : (
          <Route path="/" element={<GuestMain />} />
        )}
      </Route>
    </Routes>
  );
}

export default Router;
