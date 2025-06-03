
import React from 'react';

const ImageUploader = ({ onImageSelected }) => {
  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelected(e.target.files[0]);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleChange} />
    </div>
  );
};

export default ImageUploader;
