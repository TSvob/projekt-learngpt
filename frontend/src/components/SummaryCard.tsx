import './SummaryCard.scss'

interface SummaryItem {
  [key: string]: string;
}

type SummaryCardProps = {
  summary: string;
};

const SummaryCard: React.FC<SummaryCardProps> = ({ summary }) => {
  let parsedSummary: SummaryItem[] = [];

  try {
    parsedSummary = JSON.parse(summary);
    if (!Array.isArray(parsedSummary)) {
      parsedSummary = [parsedSummary];
    }
  } catch (error) {
    console.error('Error parsing summary:', error);
  }

  return (
    <div className='summary-card'>
      <div className='summary-card-header'>
        <button>
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
      {parsedSummary.map((item: SummaryItem, index: number) => (
        <div className='summary-card-item' key={index}>
          {Object.entries(item).map(([key, value]) => (
            <p key={key}>
              <span className='key'>{key}:</span>{' '}
              <span className='value'>{typeof value === 'object' ? JSON.stringify(value) : value}</span>
            </p>
          ))}
        </div>
      ))}
    </div>
  );
};

export default SummaryCard;