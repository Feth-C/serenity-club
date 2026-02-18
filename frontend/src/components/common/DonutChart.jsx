// frontend/src/components/common/DonutChart.jsx

import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const DonutChart = ({ title, data, onClickSegment }) => {
  const options = {
    plugins: {
      legend: { position: 'bottom' }
    },
    onClick: (evt, elements) => {
      if (!elements.length || !onClickSegment) return;
      const index = elements[0].index;
      const label = data.labels[index];
      let status = '';
      switch (label) {
        case 'Validi': status = 'valid'; break;
        case 'In Scadenza': status = 'expiring'; break;
        case 'Scaduti': status = 'expired'; break;
        default: status = ''; break;
      }
      onClickSegment(status);
    }
  };

  return (
    <div style={{ flex: 1 }}>
      <h2>{title}</h2>
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default DonutChart;
