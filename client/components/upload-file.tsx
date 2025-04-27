import { Input } from "@/components/ui/input"
import axios from "axios";

export function UploadFile() {

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        console.log(file)
        if (file) {
            const formData = new FormData();
            formData.append("pdf", file);

            await axios.post("http://localhost:5000/upload/pdf", formData, {
                headers: {
                    "Content-Type": "application/pdf",
                },
            })
            console.log("File uploaded successfully")
        }

    }

    return (
        <div className="w-[80%]">
            <Input type="file" onChange={handleFileChange} />
        </div>
    )
}
