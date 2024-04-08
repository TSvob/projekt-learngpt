import React from "react";
import Logout from "./Logout";
import { SidebarProps } from "../interfaces/sidebar-interface";

import "./Sidebar.scss";

const Sidebar: React.FC<SidebarProps> = ({
  templates,
  setActiveTemplateId,
  onOpenModal,
}) => {

  return (
    <div className="sidebar-container flex flex-col w-72 p-5">
      <div className="sidebar-header">
        <h1 className="text-4xl font-bold">GPT-learn</h1>
      </div>
      <hr className="mt-3" />
      <div className="sidebar-body mt-2">
        <button
          className="w-full my-3 p-2 text-white bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E1E1E]"
          onClick={onOpenModal}
        >
          + Nová šablona
        </button>
        <ol>
          {templates && templates.map((template) => {
            return (
              <li
                key={template.id}
                className="sidebar-item flex justify-between truncate"
              >
                <button onClick={() => setActiveTemplateId(template.id)}>
                  {template.template_name}
                </button>
                <button className="sidebar-item-edit-button">
                  <i className="fa-regular fa-pen-to-square"></i>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="sidebar-footer mt-auto py-2 px-5">
        <Logout />
      </div>
    </div>
  );
};

export default Sidebar;
