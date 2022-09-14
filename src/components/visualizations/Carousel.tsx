import { useState } from "react";
import { Stack } from "@chakra-ui/react";
import useInterval from "react-useinterval";
import { ISection } from "../../interfaces";
import Visualization from "./Visualization";

const Carousel = (section: ISection) => {
  const [index, setIndex] = useState<number>(0);
  const [pause, setPause] = useState<boolean>(false);
  section
  const increment = () => {
    if (!pause) {
      setIndex((s: number) => (s + 1) % section.visualizations.length);
    }
  };
  useInterval(increment, 1000 * 10);
  return (
    <Stack onClick={() => setPause(!pause)} w="100%" h="100%" flex={1}>
      <Visualization
        key={section.visualizations[index].id}
        visualization={section.visualizations[index]}
        section={section}
      />
    </Stack>
  );
};

export default Carousel;