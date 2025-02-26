import React, { useEffect, useRef, useState } from "react";

const Modal = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const trigger = useRef(null);
  const modal = useRef(null);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!modal.current) return;
      if (
        !modalOpen ||
        modal.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setModalOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!modalOpen || keyCode !== 27) return;
      setModalOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  return (
    <>
      <div className="container mx-auto py-20">
        <button
          ref={trigger}
          onClick={() => setModalOpen(true)}
          className={`underline text-blue-500 text-sm font-medium`}
        >
          How to Organize Files in Drive
        </button>
        <div
          className={`fixed left-0 top-0 flex h-full min-h-screen w-full items-center justify-center bg-dark/90 px-4 py-5 ${
            modalOpen ? "block" : "hidden"
          }`}
        >
          <div
            ref={modal}
            onFocus={() => setModalOpen(true)}
            onBlur={() => setModalOpen(false)}
            className="w-full max-w-[570px] rounded-[20px] bg-white px-8 py-12 text-center dark:bg-dark-2 md:px-[70px] md:py-[60px]"
          >
            <h3 className="pb-[18px] text-xl font-semibold text-dark dark:text-white sm:text-2xl">
            How to Organize Files in Drive
            </h3>
            <span
              className={`mx-auto mb-6 inline-block h-1 w-[90px] rounded bg-primary`}
            ></span>
            <p className="mb-10 text-base leading-relaxed text-body-color dark:text-dark-6">
            <div class="mb-4">
        <label class="block text-md font-medium mb-2 text-left">Steps:</label>
        <ol class="list-decimal pl-5 text-sm">
          <li class="mb-2 text-left">Create a new folder in your drive.</li>
          <li class="mb-2 text-left">Upload your mockups to this folder.</li>
          <li class="mb-2 text-left">Organize your prints by separating them into categories like front side print, back side print, and side print.</li>
          <li class="mb-2 text-left">Ensure that the files are set to be shareable with view permissions for all users.</li>
          <li class="mb-2 text-left">Rename the file names to the size in inches (e.g., 12x16 inches).</li>
          <a href="https://drive.google.com/drive/folders/1NASOm0frVDqfdvpm6svgi2zWvQTWJtaO?usp=sharing" class="underline text-blue-500 mb-2 text-left" target="_blank" >View a example file</a>
            
        </ol>
      </div>
            </p>
            <div className="-mx-3 flex flex-wrap">
              <div className="w-1/2 px-3">
                <button
                  onClick={() => setModalOpen(false)}
                  className="block w-full rounded-md border border-stroke p-3 text-center text-base font-medium text-dark transition hover:border-red-600 hover:bg-red-600 hover:text-white dark:text-white"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;
