import { useEffect, useState } from "react";
import { Card } from "../../components/Card/Card"; // Ensure you have a Card component
import styles from "./App.module.scss";
import html2pdf from "html2pdf.js";

export default function VocabularyApp() {
  const [inputValue, setInputValue] = useState("");
  const [words, setWords] = useState<string[]>([]);
  const [images, setImages] = useState<{ type: "image"; src: string }[]>([]);
  const [sheets, setSheets] = useState<(string | { type: "image"; src: string })[][]>([]);
  const [downloading, setDownloading] = useState<Boolean>(false);

  useEffect(() => {
    setSheets(getSheets());
  }, [words, images]);

  // Function to chunk the array into sheets of 8 items (words + images)
  const getSheets = () => {
    const combined = [...images, ...words];
    const sheets: (string | { type: "image"; src: string })[][] = [];
    for (let i = 0; i < combined.length; i += 8) {
      sheets.push(combined.slice(i, i + 8));
    }
    return sheets;
  };  

  // Handle text input
  const handleTextInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  
    const newWords = e.target.value
      .split(",")
      .map((word) => word != " " ? word.trim() : " ") // enables to create empty card
      .filter(Boolean);
  
    console.log(e.target.value.split(","))
    setWords(newWords);
  };
  

  // Handle image uploads
  const handleImageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;
  
    const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const files = Array.from(fileList);
  
    files.forEach((file) => {
      if (!validImageTypes.includes(file.type)) {
        alert("Only image files are allowed.");
        return;
      }
  
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [...prev, { type: "image", src: reader.result as string }]);
      };
  
      reader.readAsDataURL(file);
    });
  };
  

  const removeImage = (indexToRemove: number) => {
    console.log(indexToRemove)
    console.log(images)
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };
  

  // Generate and download PDF using html2pdf.js
  const downloadPDF = () => {
    setDownloading(true)

    const element = document.getElementById("vocabulary-container");

    if (element) {
      html2pdf()
        .from(element)
        .set({
          margin: [0, 0, 0, 0], // Remove margins
          filename: "gruber_je_vocas.pdf",
          html2canvas: {
            scale: 2,
            logging: false,
            useCORS: true,
          },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait",
            autoPrint: true,
          },
        })
        .toPdf() // Convert to PDF before saving
        .get('pdf')
        .then((pdf: { internal: { getNumberOfPages: () => any; }; deletePage: (arg0: any) => void; }) => {
          const totalPages = pdf.internal.getNumberOfPages();
          
          if (totalPages > 1) {
            pdf.deletePage(totalPages); // Removes the last page
          }
        })
        .save() // Save the modified PDF
        .finally(() => {
          setDownloading(false);
        });
    }
    
  };

  return (
    <div className={styles.container}>
      {/* Input Section */}
      <div className={styles.inputContainer}>
        <textarea
          className={styles.inputBox}
          value={inputValue}
          onChange={handleTextInputChange}
          placeholder="Enter words separated by commas..."
        />
        <h1>OR</h1>
        <label className={styles.uploadButton}>
          Upload Images
          <input type="file" multiple accept="image/*" onChange={handleImageInput} />
        </label>
      </div>
      <div className={styles.getPDFBtn} onClick={downloadPDF}>
        <button disabled={sheets.length === 0}>Generate PDF</button>
      </div>

      {/* Vocabulary Sheets */}
      <div id="vocabulary-container" className={styles.sheetsContainer}
      style={{ gap: downloading ? 0 : "20px" }}>
        {sheets.map((sheet, sheetIndex) => (
          <div key={sheetIndex} className={styles.vocabularySheet}>
            <div style={{ paddingTop: "20px" }}>
              <div className={styles.cardGrid}>
                {sheet.map((item, index) => (
                  <Card key={index} vocab={item} onRemove={() => removeImage(index)} isDownloading={downloading} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
