import axios from "axios";
import { AnimatePresence } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as S from "./Styles/WriteDiary.style";

interface MusicModalProps {
  trackId: string;
  socialId: string;
  onClose: () => void;
}

export interface Artist {
  name: string;
}

export interface Album {
  name: string;
  images: { url: string }[];
  release_date: string;
}

export interface TrackInfo {
  id: string;
  name: string;
  artists: Artist[];
  album: Album;
  preview_url: string | null;
  duration_ms: number;
  isLiked: boolean; // 백엔드에서 제공하는 isLiked 값을 포함
}

const MusicModal: React.FC<MusicModalProps> = ({
  trackId,
  socialId,
  onClose,
}) => {
  const [trackInfo, setTrackInfo] = useState<TrackInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrackInfo = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/spotify/track/${trackId}`
        );

        switch (response.data.status_code) {
          case 200:
            setTrackInfo(response.data.response);
            setError(null);
            break;
          case 204:
            setError("스포티파이 토큰을 검색할 수 없습니다.");
            break;
          case 404:
            setError("트랙 내용을 찾을 수 없습니다. 다른 트랙을 시도하십시오.");
            break;
          case 503:
            setError("스포티파이 코드가 200이 아닙니다.");
            break;
          default:
            setError("Unknown error occurred.");
        }
      } catch (error) {
        console.error("트랙 정보를 가져오는 중 오류 발생:", error);
        setError("트랙 정보를 가져오지 못했습니다. 나중에 다시 시도하십시오.");
      }
    };

    if (trackId) {
      fetchTrackInfo();
    }
  }, [trackId]);

  const handleClose = () => {
    onClose();
    navigate("/");
  };

  const handleLikeToggle = async () => {
    if (!trackInfo) return;

    const isLiked = trackInfo.isLiked;
    try {
      await axios.put("http://localhost:8080/music/likes", {
        socialId: socialId,
        spotify: trackId,
        like: isLiked,
      });
      setTrackInfo({ ...trackInfo, isLiked: !isLiked }); // isLiked 상태 토글
      setShowNotification(
        isLiked ? "좋아요를 취소했습니다." : "좋아요를 누르셨습니다."
      );
      setTimeout(() => setShowNotification(null), 2000);
    } catch (error) {
      console.error("Error updating like status:", error);
    }
  };

  return (
    <S.ModalOverlay>
      <S.ModalContainer onClick={(e) => e.stopPropagation()}>
        <S.ModalContent>
          <h3>추천 노래</h3>
          {error ? (
            <p>{error}</p>
          ) : trackInfo ? (
            <>
              <div>
                {trackInfo.name} -{" "}
                {trackInfo.artists.map((artist) => artist.name).join(", ")}
              </div>
              <div>Album: {trackInfo.album.name}</div>
              <S.AlbumCover
                src={trackInfo.album.images[0].url}
                alt="Album Cover"
              />
              {trackInfo.preview_url ? (
                <audio ref={audioRef} autoPlay>
                  <source
                    src={trackInfo.preview_url ?? undefined}
                    type="audio/mpeg"
                  />
                </audio>
              ) : (
                <p>이 곡은 재생할 수 없습니다.</p>
              )}
              <S.LikeButton onClick={handleLikeToggle}>
                {trackInfo.isLiked ? "❤️" : "🤍"}
              </S.LikeButton>
              <AnimatePresence>
                {showNotification && (
                  <S.Notification
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {showNotification}
                  </S.Notification>
                )}
              </AnimatePresence>
            </>
          ) : (
            <p>노래를 추천중입니다...</p>
          )}
          <S.ModalButton onClick={handleClose}>×</S.ModalButton>
        </S.ModalContent>
      </S.ModalContainer>
    </S.ModalOverlay>
  );
};

export default MusicModal;
