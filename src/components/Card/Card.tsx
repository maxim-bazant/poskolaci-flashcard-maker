import styles from "./Card.module.scss";
import logo from "../../assets/logo.png";

interface CardProps {
  vocab: string | { type: "image"; src: string };
  onRemove?: () => void;
  isDownloading: Boolean;
}

export const Card = ({ vocab, onRemove, isDownloading }: CardProps) => {
  return (
    <div className={styles.mainContainer}>
      <div className={styles.container}>
        {typeof vocab === "string" ? (
            null
        ) : (
            !isDownloading && (
                <div className={styles.removeButton} onClick={onRemove}>
                    <p>&times;</p>
                </div>
            )
        )}
        <div className={styles.topText}>
          <img src={logo} alt="logo" />
        </div>
        <div className={styles.vocab}>
          {typeof vocab === "string" ? (
            <h1>{vocab}</h1>
          ) : (
            <div>
              <img src={vocab.src} alt="uploaded" className={styles.uploadedImage} />
            </div>
          )}
        </div>
        <div className={styles.bottomText}>
          <img src={logo} alt="logo" />
        </div>
      </div>
    </div>
  );
};
