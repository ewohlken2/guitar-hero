import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { ChordPalette } from "../../../src/components/editor/ChordPalette";

describe("ChordPalette", () => {
  const defaultProps = {
    selectedChord: null as string | null,
    onSelectChord: jest.fn(),
  };

  it("renders common chord buttons", () => {
    const { getByText } = render(<ChordPalette {...defaultProps} />);

    expect(getByText("G")).toBeTruthy();
    expect(getByText("C")).toBeTruthy();
    expect(getByText("D")).toBeTruthy();
    expect(getByText("Em")).toBeTruthy();
    expect(getByText("Am")).toBeTruthy();
  });

  it("calls onSelectChord when chord is pressed", () => {
    const onSelectChord = jest.fn();
    const { getByText } = render(
      <ChordPalette {...defaultProps} onSelectChord={onSelectChord} />,
    );

    fireEvent.press(getByText("G"));
    expect(onSelectChord).toHaveBeenCalledWith("G");
  });

  it("highlights selected chord", () => {
    const { getByTestId } = render(
      <ChordPalette {...defaultProps} selectedChord="G" />,
    );

    const gButton = getByTestId("chord-button-G");
    expect(gButton.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: expect.any(String) }),
      ]),
    );
  });

  it("supports search filtering", () => {
    const { getByPlaceholderText, getAllByText, getByText } = render(
      <ChordPalette {...defaultProps} />,
    );

    const searchInput = getByPlaceholderText("Search chords...");
    fireEvent.changeText(searchInput, "Am");

    // Am should appear in both quick access and search results
    const amButtons = getAllByText("Am");
    expect(amButtons.length).toBeGreaterThanOrEqual(1);
    // Search results section should appear
    expect(getByText("Search Results")).toBeTruthy();
  });
});
