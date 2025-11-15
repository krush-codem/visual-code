// src/components/ReadmeModal.jsx
import React from "react";

const ReadmeModal = ({ content, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Generated README.md</h3>
          <button className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <pre className="readme-pre">{content}</pre>
        </div>
      </div>
    </div>
  );
};

export default ReadmeModal;
