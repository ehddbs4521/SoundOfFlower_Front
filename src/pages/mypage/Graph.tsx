import axios from "axios";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import api from "../../axiosInterceptor";
import * as S from "./Styles/Graph.style";
import {
  HighestEmotionData,
  findWeeklyHighestEmotion,
} from "./components/findWeeklyHighestEmotion";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface GraphProps {
  startYear: number;
  startMonth: number;
  startDay: number;
  endYear: number;
  endMonth: number;
  endDay: number;
}

interface EmotionData {
  date: string;
  angry: number;
  sad: number;
  delight: number;
  calm: number;
  embarrased: number;
  anxiety: number;
  love: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
  }[];
}

function Chart({
  startYear,
  startMonth,
  startDay,
  endYear,
  endMonth,
  endDay,
}: GraphProps) {
  const [isEmpty, setIsEmpty] = useState<boolean>(true);
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    datasets: [
      {
        label: "Emotion Distribution",
        data: [],
        backgroundColor: [],
      },
    ],
  });

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      api.defaults.headers.common["Authorization-Access"] = `Bearer ${token}`;
      console.log("Access token retrieved:", token);
    } else {
      console.log("token error");
    }
  }, []);

  useEffect(() => {
    const fetchEmotionStatistics = async (
      startYear: number,
      startMonth: number,
      startDay: number,
      endYear: number,
      endMonth: number,
      endDay: number
    ) => {
      try {
        const response = await api.get("/statistic/emotion", {
          params: {
            startYear,
            startMonth,
            startDay,
            endYear,
            endMonth,
            endDay,
          },
        });

        const data = response.data;
        console.log("[Graph response: ", data, "]");

        const emotionCounts = {
          angry: 0,
          sad: 0,
          delight: 0,
          calm: 0,
          embarrased: 0,
          anxiety: 0,
          love: 0,
        };

        const highestEmotions: HighestEmotionData[] =
          findWeeklyHighestEmotion(data);
        console.log("[Highest Emotions: ", highestEmotions, "]");

        highestEmotions.forEach((entry: HighestEmotionData) => {
          switch (entry.highestEmotion) {
            case "angry":
              emotionCounts.angry += 1;
              break;
            case "sad":
              emotionCounts.sad += 1;
              break;
            case "delight":
              emotionCounts.delight += 1;
              break;
            case "calm":
              emotionCounts.calm += 1;
              break;
            case "embarrased":
              emotionCounts.embarrased += 1;
              break;
            case "anxiety":
              emotionCounts.anxiety += 1;
              break;
            case "love":
              emotionCounts.love += 1;
              break;
            default:
              break;
          }
        });

        const totalEmotionCount = Object.values(emotionCounts).reduce(
          (acc, count) => acc + count,
          0
        );

        setIsEmpty(totalEmotionCount === 0);

        setChartData({
          labels: [
            "Angry",
            "Sad",
            "Delight",
            "Calm",
            "Embarrassed",
            "Anxiety",
            "Love",
          ],
          datasets: [
            {
              label: "Emotion Distribution",
              data: [
                emotionCounts.angry,
                emotionCounts.sad,
                emotionCounts.delight,
                emotionCounts.calm,
                emotionCounts.embarrased,
                emotionCounts.anxiety,
                emotionCounts.love,
              ],
              backgroundColor: [
                "#FF6384", // Angry
                "#36A2EB", // Sad
                "#FFCE56", // Delight
                "#4BC0C0", // Calm
                "#9966FF", // Embarrassed
                "#FF9F40", // Anxiety
                "#FFCD56", // Love
              ],
            },
          ],
        });
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Emotion statistics fetch error: ", error.message);
          if (error.response) {
            console.error("Error response data: ", error.response.data);
          }
        } else {
          console.error("Error: ", error);
        }
      }
    };

    fetchEmotionStatistics(
      startYear,
      startMonth,
      startDay,
      endYear,
      endMonth,
      endDay
    );
  }, [startYear, startMonth, startDay, endYear, endMonth, endDay]);

  return (
    <div>
      <h2>Weekly Emotion Distribution</h2>
      {isEmpty ? (
        <S.Emptymessage>이번 주 일기를 작성해주세요</S.Emptymessage>
      ) : (
        <Pie data={chartData} />
      )}
    </div>
  );
}

export default Chart;
