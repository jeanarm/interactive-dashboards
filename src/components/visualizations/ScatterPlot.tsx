import { useStore } from 'effector-react';
import Plot from 'react-plotly.js';
import { ChartProps } from '../../interfaces';
import { $visualizationData } from '../../Store';
import { $visualizationMetadata } from '../../Store';

interface ScatterPlotProps extends ChartProps {
  category?: string;
  series?: string;
}

const ScatterPlot = ({ visualization}: ScatterPlotProps) => {
  const visualizationData = useStore($visualizationData)?.[visualization.id];
  const metadata = useStore($visualizationMetadata)?.[visualization.id];

  const traces = visualizationData?.map((data: any, i: number) => {
    const monthData = metadata?.[data.pe];
    return {
      x: [monthData?.name],
      y: [parseFloat(data.value)],
      mode: 'markers',
      type: 'scatter',
      //name: series ? `${category} ${series} ${i + 1}` : `${category} ${i + 1}`,
      marker: { size: 12 },
    };
  }) || [];

  return (
    <Plot
      data={traces}
      layout={{
        title: 'Scatter Plot',
        xaxis: {
          title: 'Month',
        },
        yaxis: {
          title: 'Doses Given',
        },
       showlegend:false,
      }}
      style={{ width: '100%', height: '100%' }}
      config={{ displayModeBar: false, responsive: true }}
    />
  );
};

export default ScatterPlot;
