import { useState } from "react";
import { X } from "lucide-react"; // hoặc dùng icon khác

function TagsInput({ tags, setTags }) {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = inputValue.trim();
      if (value && !tags.includes(value)) {
        setTags([...tags, value]);
      }
      setInputValue("");
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      // Xóa tag cuối khi backspace ở đầu input
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="w-full p-2 border border-gray-300 rounded min-h-[42px] flex flex-wrap items-center gap-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
      {/* Tags added */}
      {tags.map((tag, index) => (
        <span
          key={index}
          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(index)}
            className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
          >
            <X size={14} />
          </button>
        </span>
      ))}

      {/* Input to enter new tags */}
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        placeholder={tags.length === 0 ? "Enter tags, separated by commas or Enter" : ""}
        className="flex-1 min-w-[200px] outline-none py-1 text-sm"
      />
    </div>
  );
}

export default TagsInput;