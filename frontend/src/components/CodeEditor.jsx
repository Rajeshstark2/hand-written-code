import React from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ code, language, onChange }) => {
  return (
    <div className="h-[400px] w-full">
      <Editor
        height="100%"
        defaultLanguage={language}
        value={code}
        onChange={onChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          readOnly: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;