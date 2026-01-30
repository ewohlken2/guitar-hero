import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { TimelineGrid } from "../../../src/components/editor/TimelineGrid";

describe("TimelineGrid", () => {
  const defaultProps = {
    bpm: 120,
    duration: 30,
    zoom: 1,
    currentTime: 0,
    onTimePress: jest.fn(),
  };

  it("renders without crashing", () => {
    const { getByTestId } = render(<TimelineGrid {...defaultProps} />);
    expect(getByTestId("timeline-grid")).toBeTruthy();
  });

  it("displays beat markers", () => {
    const { getAllByTestId } = render(<TimelineGrid {...defaultProps} />);
    const markers = getAllByTestId(/beat-marker/);
    expect(markers.length).toBeGreaterThan(0);
  });

  it("shows measure numbers", () => {
    const { getAllByText } = render(<TimelineGrid {...defaultProps} />);
    // At 120 BPM with 4/4 time, measure 1 starts at 0
    const measureOnes = getAllByText("1");
    expect(measureOnes.length).toBeGreaterThan(0);
  });

  it("calls onTimePress when grid is tapped", () => {
    const onTimePress = jest.fn();
    const { getByTestId } = render(
      <TimelineGrid {...defaultProps} onTimePress={onTimePress} />,
    );

    fireEvent.press(getByTestId("timeline-grid"), {
      nativeEvent: { locationX: 100 },
    });

    expect(onTimePress).toHaveBeenCalled();
  });

  it("adjusts grid density based on zoom", () => {
    const { getAllByTestId: getMarkersZoom1 } = render(
      <TimelineGrid {...defaultProps} zoom={1} />,
    );
    const { getAllByTestId: getMarkersZoom2 } = render(
      <TimelineGrid {...defaultProps} zoom={2} />,
    );

    const markersZoom1 = getMarkersZoom1(/beat-marker/);
    const markersZoom2 = getMarkersZoom2(/beat-marker/);

    // Higher zoom should show more detail (same or more markers visible)
    expect(markersZoom2.length).toBeGreaterThanOrEqual(markersZoom1.length);
  });
});
