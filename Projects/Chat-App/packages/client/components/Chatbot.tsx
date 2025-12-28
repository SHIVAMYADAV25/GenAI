import { FaArrowUp } from "react-icons/fa";
import { useForm } from "react-hook-form";
import type { KeyboardEvent } from "react";

/**
 * Shape of the form data handled by react-hook-form
 */
type FormData = {
  prompt: string;
};

const Chatbot = () => {
  /**
   * useForm manages form state and validation
   * mode: "onChange" ensures validation runs on every keystroke
   * so `formState.isValid` updates in real time
   */
  const { register, handleSubmit, reset, formState } = useForm<FormData>({
    mode: "onChange",
  });

  /**
   * Called when the form is successfully submitted
   * Receives validated form data
   */
  const onSubmit = (data: FormData) => {
    console.log(data);
    // Clear textarea after successful submit
    reset();
  };

  /**
   * Handles keyboard behavior inside the textarea
   * - Enter → submit the form
   * - Shift + Enter → insert a new line
   */
  const onKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // prevent newline
      handleSubmit(onSubmit)(); // manually trigger form submission
    }
  };

  return (
    /**
     * Form wrapper
     * handleSubmit ensures validation runs before calling onSubmit
     */
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-2 items-end border-2 p-4 rounded-3xl"
    >
      {/*
        Textarea input registered with react-hook-form
        Validation rules:
        - required
        - trimmed value must not be empty
      */}
      <textarea
        {...register("prompt", {
          required: true,
          validate: (data) => data.trim().length > 0,
        })}
        onKeyDown={onKeyDown}
        className="w-full border-0 focus:outline-0 resize-none"
        placeholder="Ask anything"
        maxLength={100}
      />

      {/*
        Submit button
        - Disabled when form is invalid
        - Smooth fade + scale effect when disabled
        - Visual feedback improves UX
      */}
      <button
        type="submit"
        disabled={!formState.isValid}
        className="
          rounded-full w-9 h-9
          bg-black
          flex justify-center items-center
          transition-all duration-200 ease-in-out
          disabled:opacity-40
          disabled:scale-95
          disabled:cursor-not-allowed
        "
      >
        <FaArrowUp color="white" />
      </button>
    </form>
  );
};

export default Chatbot;
