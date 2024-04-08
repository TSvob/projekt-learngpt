import { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../contexts/useUser";
import SummaryCard from "../components/SummaryCard";
import Sidebar from "../components/Sidebar";
import TemplateModal from "../components/Modals/TemplateModal";
import { TemplateInterface } from "../interfaces/template-interface";
import { SummaryInterface } from "@/interfaces/summary-interface";

import "./Templates.scss";

const Templates = () => {
  const { user } = useUser();
  const [templates, setTemplates] = useState<TemplateInterface>();
  const [activeTemplateId, setActiveTemplateId] = useState<string>(
    "4da614af-90cb-466d-91a6-18b9d85385df"
  );
  const [firstTemplate, setFirstTemplate] = useState<string>('');
  const [summaries, setSummaries] = useState<SummaryInterface[]>([]);
  const [input, setInput] = useState("");
  const [summaryResponse, setSummaryResponse] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (user?.id) {
        await getTemplates(user.id);
        getSummaries(user.id, firstTemplate);
      }
    };
  
    loadData();
  }, []);

  useEffect(() => {
    getSummaries(user?.id || "", activeTemplateId);
    console.log("Fetching summaries for template", activeTemplateId);
  }, [activeTemplateId, user?.id]);

  const getTemplates = async (authorId: string) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5001/api/get-template-names?author_id=${authorId}`
      );
      setTemplates(response.data);
      setFirstTemplate(response.data[0].id);
      console.log(response.data)
      if (response.data.length === 0) {
        console.log("No templates found for this user.");
      }
    } catch (error) {
      console.error("Error fetching templates", error);
    }
  };

  const getSummaries = async (authorId: string, templateId: string) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5001/api/get-summaries/${authorId}/${templateId}`
      );
      setSummaries(response.data);
    } catch (error) {
      console.error("Error fetching summaries", error);
    }
  };

  const requestNewSummary = async () => {
    const inputData = {
      text: input,
      template_id: activeTemplateId,
      author_id: user?.id,
    };

    try {
      const response = await axios.post(
        "http://127.0.0.1:5001/api/new-summary",
        inputData
      );
      setSummaryResponse(response.data.summary);
      console.log(response.data.summary);
      console.log(summaryResponse);
      setSummaries((prevSummaries) => [
        ...(Array.isArray(prevSummaries) ? prevSummaries : []),
        response.data.summary,
      ]);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="home-page">
      <div className="home-page-container min-h-screen font-mono flex-row flex">
        <section className="sidebar">
          <Sidebar
            templates={templates}
            setActiveTemplateId={setActiveTemplateId}
            onOpenModal={() => setIsModalOpen(true)}
          />
        </section>
        <div className="template flex-col flex-auto">
          <div className="templates-container flex text-md">
            {summaries ? (
              summaries.map((summary, index) => {
                return <SummaryCard key={index} summary={summary} />;
              })
            ) : (
              <div className="w-full justify-center text-xl">
                Tato šablona je zatím prázdná
              </div>
            )}
          </div>
          <div className="template-footer mt-auto justify-center">
            <div className="template-input">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  requestNewSummary();
                }}
              >
                <input
                  className="p-0.5 h-14"
                  type="text"
                  autoFocus
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Zadejte nové téma..."
                />
                <button
                  className="chat-send-btn w-10"
									type="submit"
                  onClick={requestNewSummary}
                >
                  <i
                    className="fa-regular fa-paper-plane fa-lg"
                    style={{ color: "#000000" }}
                  ></i>
                </button>
              </form>
            </div>
          </div>
        </div>
        <TemplateModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          refreshTemplates={() => getTemplates(user?.id || "")}
        />
      </div>
    </div>
  );
};

export default Templates;