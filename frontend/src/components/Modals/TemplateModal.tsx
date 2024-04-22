import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../../contexts/useUser";
import { useSnackbar } from "notistack";

import "./TemplateModal.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  refreshTemplates: () => void;
}

const TemplateModal: React.FC<Props> = ({
  isOpen,
  onClose,
  refreshTemplates,
}) => {
  const { user } = useUser();
  const { enqueueSnackbar } = useSnackbar();
  const [templateName, setTemplateName] = useState("");
  const [template_topic, setTemplateTopic] = useState("");
  const [fields, setFields] = useState("");

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("click", handleOutsideClick);
    }

    return () => {
      window.removeEventListener("click", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://127.0.0.1:5001/api/new-template",
        {
          author_id: user?.id,
          template_name: templateName,
          template_topic: template_topic,
          fields: fields.split(","),
        }
      ).then((response) => {
        if (response.status === 200 || response.status === 201) {
          console.log("Request successful");
          if (refreshTemplates) {
            refreshTemplates();
          }
          onClose();
          enqueueSnackbar("Nová šablona vytvořena", { variant: "success" });
        } else {
          console.log(response)
          console.log("Request failed with status code:", response.status);
          enqueueSnackbar("Chyba při vytváření šablony", { variant: "error" });
        }
      })
    } catch (error) {
      console.error("Error:", error);
      enqueueSnackbar("Chyba při vytváření šablony", { variant: "error" });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="template-modal-container">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-md">
        <span className="flex justify-between">
          <h1 className="text-[#1E1E1E] float-start text-2xl font-bold mb-4">
            Nová šablona
          </h1>
          <button onClick={onClose} className="self-start">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </span>
        <input
          type="text"
          placeholder="Název nové šablony"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          className="w-full mb-4 p-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1E1E1E]"
        />
        <input
          type="text"
          placeholder="O co se jedná? Napište stručně téma..."
          value={template_topic}
          onChange={(e) => setTemplateTopic(e.target.value)}
          className="w-full mb-4 p-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1E1E1E]"
        />
        <input
          type="text"
          value={fields}
          onChange={(e) => setFields(e.target.value)}
          placeholder="Zajimave udaje"
          className="w-full mb-4 p-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1E1E1E]"
        />
        <span className="flex">
          <button
            id="closeBtn"
            className="w-full mt-3 mr-3 p-2 text-white bg-gray-400 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E1E1E]"
            onClick={onClose}
          >
            Zrušit
          </button>
          <button
            type="submit"
            id="submitBtn"
            className="w-full mt-3 p-2 text-white bg-[#1E1E1E] rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E1E1E]"
            onClick={handleSubmit}
          >
            Vytvořit novou šablonu
          </button>
        </span>
      </form>
    </div>
  );
};

export default TemplateModal;
