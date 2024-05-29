import axios from 'axios';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthProvider";
import logo from "../../assets/icons/logo.webp";
import * as S from "../layouts/Styles/Header.style";

function Header() {
  const navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn, nickname, email } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  const token = localStorage.getItem('accessToken');

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleLoginClick = () => {
    navigate("/Login");
  };

  const handleJoinClick = () => {
    navigate("/Join");
  };

  const handleLogoutClick = async () => {
    try {
      await axios.post('http://localhost:8080/token/logout', {}, {
        headers: {
          'authorization-access': `Bearer ${token}`
        }
      });

      alert("로그아웃 성공.");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("nickName");
      localStorage.removeItem("email");
      delete axios.defaults.headers.common["authorization-access"];
      setIsLoggedIn(false);
      navigate("/");
    } catch (error) {
      console.error("로그아웃 실패:", error);
      alert("로그아웃에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleWriteDiaryClick = () => {
    navigate("/WriteDiary");
  };

  const handleCalendarClick = () => {
    navigate("/");
  };

  const handleMypageClick = () => {
    navigate("/mypage");
  };


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <S.HeaderContainer $isScrolled={isScrolled}>
      <S.Logo src={logo} alt="Logo" onClick={handleLogoClick} />
      {isLoggedIn && (
        <S.LeftButtonContainer>
          <S.LinkButton onClick={handleWriteDiaryClick}>일기작성</S.LinkButton>
          <S.LinkButton onClick={handleCalendarClick}>캘린더</S.LinkButton>
          <S.LinkButton onClick={handleMypageClick}>마이페이지</S.LinkButton>
        </S.LeftButtonContainer>
      )}
      <S.RightButtonContainer>
        {!isLoggedIn ? (
          <>
            <S.Button onClick={handleLoginClick}>로그인</S.Button>
            <S.Button onClick={handleJoinClick}>회원가입</S.Button>
          </>
        ) : (
          <S.Button onClick={handleLogoutClick}>로그아웃</S.Button>
        )}
      </S.RightButtonContainer>
    </S.HeaderContainer>
  );
}

export default Header;
