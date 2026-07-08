import { useState } from "react";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";

interface Props {
  onSubmit?: () => void;
  onClose: () => void;
  title?: string;
}

export default function ModalFooter({
  onSubmit,
  onClose,
  title,
}: Props) {

  const [btnLoading, setBtnLoading] = useState(false);
  return (
    <div style={{
              padding: "16px 28px 22px",
              borderTop: "1.5px solid #f0fdf4",
              display: "flex", justifyContent: "flex-end", gap: 10,
            }}>
    
              <SecondaryButton
                title="Cancel"
                onClick={onClose}
              />
    
            {title && onSubmit && (

              <PrimaryButton
                btnType="submit"
                title={title}
                onClick={ async ()=>{
                  try {
                    setBtnLoading(true);
                    await onSubmit();
                  }
                  finally{
                    setBtnLoading(false);
                  }
                }}
                loading={btnLoading}
              />
            )}
            </div>
  );
}