/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../contexts/useUser";
import { closeSnackbar, useSnackbar } from "notistack";
import SummaryCard from "../components/SummaryCard";
import Sidebar from "../components/Sidebar";
import TemplateModal from "../components/Modals/TemplateModal";
import { TemplateInterface } from "../interfaces/template-interface";
import { SummaryInterface } from "@/interfaces/summary-interface";

import "./Templates.scss";

const Templates = () => {
  const { user } = useUser();
  const { enqueueSnackbar } = useSnackbar();
  const [templates, setTemplates] = useState<TemplateInterface[]>([]);
  const [activeTemplateId, setActiveTemplateId] = useState<string>("");
  const [summaries, setSummaries] = useState<SummaryInterface[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [input, setInput] = useState("");
  const [,setSummaryResponse] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (user?.id && activeTemplateId) {
      getSummaries(user.id, activeTemplateId);
    }
  }, [activeTemplateId]);

  const loadData = async () => {
    if (user?.id) {
      await getTemplates(user.id);
      console.log(
        "Loaded data, this is the active template currently: ",
        activeTemplateId
      );
      if (activeTemplateId) {
        getSummaries(user.id, activeTemplateId);
      }
    }
  };

  const getSummaries = async (authorId: string, templateId: string) => {
    console.log("Fetching summaries for user: ", user?.id);
    console.log("Template: ", templateId);
    try {
      const response = await axios.get(
        `http://127.0.0.1:5001/api/get-summaries/${authorId}/${templateId}`
      );
      console.log("Raw summary response: ", response.data);
      setSummaries(response.data);
    } catch (error) {
      console.error("Error fetching summaries", error);
    }
  };

  const refreshSummaries = () => {
    getSummaries(user?.id || "", activeTemplateId);
  };

  const getTemplates = async (authorId: string) => {
    console.log("Fetching templates for user: ", authorId);
    try {
      const response = await axios.get(
        `http://127.0.0.1:5001/api/get-template-names?author_id=${authorId}`
      );
      setTemplates(response.data);
      if (response.data.length > 0) {
        setActiveTemplateId(response.data[0].id);
      } else {
        console.log("No templates found for this user.");
      }
    } catch (error) {
      console.error("Error fetching templates", error);
    }
  };

  // const getSummaries = async (authorId: string, templateId: string) => {
  //   console.log("Fetching summaries for user", authorId, "and template", templateId);
  //   try {
  //     const response = await axios.get(
  //       `http://127.0.0.1:5001/api/get-summaries/${authorId}/${templateId}`
  //     );
  //     console.log(response.data)
  //     setSummaries(response.data);
  //   } catch (error) {
  //     console.error("Error fetching summaries", error);
  //   }
  // };

  const requestNewSummary = async () => {
    if (!input.trim()) {
      enqueueSnackbar("Nelze vytvořit prázdný souhrn", { variant: "error" });
      return;
    }
    setIsLoading(true);
    enqueueSnackbar("Vytvářím nový souhrn...", {
      variant: "info",
      persist: true,
    });

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
    } catch (error) {
      closeSnackbar();
      enqueueSnackbar("Nepodařilo se vytvořit nový souhrn", {
        variant: "error",
      });
      console.error("Error:", error);
    } finally {
      setInput("");
      setIsLoading(false);
      closeSnackbar();
      if (user && activeTemplateId) {
        getSummaries(user.id, activeTemplateId);
      }
      enqueueSnackbar("Nový souhrn byl úspěšně přidán", { variant: "success" });
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
            {summaries.length > 0 ? (
              summaries.map((summary, index) => (
                <SummaryCard
                  key={index}
                  summary={summary}
                  templateId={activeTemplateId}
                  refreshSummaries={refreshSummaries}
                />
              ))
            ) : (
              <div className="w-full justify-center text-xl">
                Šablona je zatím prázdná
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
                  type="button"
                  id="submitBtn"
                  disabled={isLoading}
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
