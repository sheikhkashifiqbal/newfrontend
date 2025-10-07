import React, { useState } from "react";

const AccountDetails = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    birthday: "",
    gender: "",
    email: "",
  });

  const handleChange = (e:any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e:any) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    // Submit logic here (e.g., API call)
  };

  return (
    <section>
      <form
        className="grid grid-cols-3 gap-x-4 gap-y-8"
        onSubmit={handleSubmit}
      >
        <div>
          <label className="block text-sm mb-3 text-[#495057]">
            Your full name
          </label>
          <input
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="bg-white p-4 border border-[#E9ECEF] rounded-[12px] w-full outline-none focus:outline focus:outline-gray-400 active:outline active:outline-gray-400"
            placeholder="Kamran Rustamli"
            type="text"
          />
        </div>
        <div>
          <label className="block text-sm mb-3 text-[#495057]">Birthday</label>
          <input
            name="birthday"
            value={formData.birthday}
            onChange={handleChange}
            className="bg-white p-4 border border-[#E9ECEF] rounded-[12px] w-full outline-none focus:outline focus:outline-gray-400 active:outline active:outline-gray-400"
            placeholder="30.08.1993"
            type="date"
          />
        </div>
        <div>
          <label className="block text-sm mb-3 text-[#495057]">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="bg-white p-4 py-[18px] border border-[#E9ECEF] rounded-[12px] w-full outline-none focus:outline focus:outline-gray-400 active:outline active:outline-gray-400"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-3 text-[#495057]">
            E-mail address
          </label>
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="bg-white p-4 border border-[#E9ECEF] rounded-[12px] w-full outline-none focus:outline focus:outline-gray-400 active:outline active:outline-gray-400"
            placeholder="kamran.rustemli@gmail.com"
            type="email"
          />
        </div>
        <div className="col-span-3">
          <input
            type="submit"
            value="Save changes"
            className="py-3 px-6 bg-[#3F72AF] rounded-[12px] text-white hover:bg-blue-500 cursor-pointer"
          />
        </div>
      </form>
    </section>
  );
};

export default AccountDetails;
