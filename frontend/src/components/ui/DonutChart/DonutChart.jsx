// frontend/src/components/ui/DonutChart/DonutChart.jsx

import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import EmptyState from "../EmptyState";
import "./donutChart.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const DonutChart = ({ title, data }) => {
  const hasData =
    data?.datasets?.[0]?.data?.some((value) => value > 0);

  if (!hasData) {
    return (
      <EmptyState
        title="Nessun dato"
        description="Non ci sono valori sufficienti per generare il grafico."
      />
    );
  }

  const options = {
    cutout: "65%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 12,
          padding: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.raw.toFixed(2)}`;
          }
        }
      }
    },
    maintainAspectRatio: false
  };

  return (
    <div className="donut-card">
      <h3 className="donut-title">{title}</h3>

      <div className="donut-wrapper">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
};

export default DonutChart;