import axios from "axios";
import { useSnackbar } from "notistack";
import { useUser } from "../contexts/useUser";
import { SummaryData } from "../interfaces/summary-data-interface";
import { SummaryInterface } from "../interfaces/summary-interface";

import "./SummaryCard.scss";

interface SummaryCardProps {
  summary: SummaryInterface;
  templateId: string;
  refreshSummaries: () => void;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  summary,
  templateId,
  refreshSummaries,
}) => {
  const { user } = useUser();
  const { enqueueSnackbar } = useSnackbar();

  const handleDelete = async () => {
    try {
      await axios.delete(`http://127.0.0.1:5001/api/delete-summary/`, {
        data: {
          author_id: user?.id,
          template_id: templateId,
          summary_id: summary._id,
        },
      });
      refreshSummaries();
      enqueueSnackbar("Souhrn byl úspěšně smazán", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Souhrn se nepodařilo smazat", { variant: "error" });
      console.error("Error deleting summary", error);
    }
  };

  return (
    <div className="summary-card">
      <div className="summary-card-header">
        <button onClick={handleDelete}>
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div className="summary-card-item">
        {summary.data.map((item: SummaryData, index: number) => (
          <p key={index}>
            <span className="key">{item.key}:</span>{" "}
            <span className="value">{item.value}</span>
          </p>
        ))}
      </div>
    </div>
  );
};

export default SummaryCard;