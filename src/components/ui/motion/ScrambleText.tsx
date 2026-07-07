import { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScrambleTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  characters?: string;
}

export function ScrambleText({
  text,
  className,
  delay = 0,
  duration = 1.8,
  characters = "abcdefghijklmnopqrstuvwxyz0123456789!#^&*()_+=-<>?[]{}",
}: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const controls = useAnimation();

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let intervalId: ReturnType<typeof setInterval>;

    const animate = async () => {
      // Start slightly delayed to allow for page load/scroll triggers
      timeoutId = setTimeout(() => {
        let iteration = 0;
        clearInterval(intervalId);

        intervalId = setInterval(() => {
          setDisplayText((prev) =>
            text
              .split("")
              .map((letter, index) => {
                if (index < iteration) {
                  return text[index];
                }
                if (text[index] === " ") {
                  return " ";
                }
                return characters[Math.floor(Math.random() * characters.length)];
              })
              .join(""),
          );

          if (iteration >= text.length) {
            clearInterval(intervalId);
            setDisplayText(text); // Ensure final text is perfectly rendered
          } else {
            // Calculate how many characters to reveal per tick based on duration
            const ticks = (duration * 1000) / 30;
            iteration += Math.max(text.length / ticks, 0.1);
          }
        }, 30);
      }, delay * 1000);
    };

    animate();

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [text, delay, duration, characters]);

  return (
    <motion.span
      className={cn("inline-block", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay }}
    >
      {displayText}
    </motion.span>
  );
}
