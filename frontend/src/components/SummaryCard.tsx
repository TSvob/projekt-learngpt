import axios from "axios";
import { useSnackbar } from "notistack";
import { useUser } from "../contexts/useUser";

import "./SummaryCard.scss";

interface SummaryItem {
  _id: string;
  created_at: string;
  data: any;
}

type SummaryCardProps = {
  summary: SummaryItem;
  templateId: string;
  refreshSummaries: () => void;
};

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
        {Object.entries(summary.data).map(([key, value]) => (
          <p key={key}>
            <span className="key">{key}:</span>{" "}
            <span className="value">
              {typeof value === "object" ? JSON.stringify(value) : value}
            </span>
          </p>
        ))}
      </div>
    </div>
  );
};

export default SummaryCard;
