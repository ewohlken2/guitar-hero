import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { SongMetadataForm } from "../../../src/components/editor/SongMetadataForm";

describe("SongMetadataForm", () => {
  const defaultProps = {
    title: "Test Song",
    artist: "Test Artist",
    bpm: 120,
    difficulty: 2 as const,
    onTitleChange: jest.fn(),
    onArtistChange: jest.fn(),
    onBpmChange: jest.fn(),
    onDifficultyChange: jest.fn(),
  };

  it("renders all input fields", () => {
    const { getByPlaceholderText, getByText } = render(
      <SongMetadataForm {...defaultProps} />,
    );

    expect(getByPlaceholderText("Song title")).toBeTruthy();
    expect(getByPlaceholderText("Artist name")).toBeTruthy();
    expect(getByText("120")).toBeTruthy(); // BPM display
  });

  it("calls onTitleChange when title is edited", () => {
    const onTitleChange = jest.fn();
    const { getByPlaceholderText } = render(
      <SongMetadataForm {...defaultProps} onTitleChange={onTitleChange} />,
    );

    fireEvent.changeText(getByPlaceholderText("Song title"), "New Title");
    expect(onTitleChange).toHaveBeenCalledWith("New Title");
  });

  it("calls onArtistChange when artist is edited", () => {
    const onArtistChange = jest.fn();
    const { getByPlaceholderText } = render(
      <SongMetadataForm {...defaultProps} onArtistChange={onArtistChange} />,
    );

    fireEvent.changeText(getByPlaceholderText("Artist name"), "New Artist");
    expect(onArtistChange).toHaveBeenCalledWith("New Artist");
  });

  it("allows BPM adjustment", () => {
    const onBpmChange = jest.fn();
    const { getByTestId } = render(
      <SongMetadataForm {...defaultProps} onBpmChange={onBpmChange} />,
    );

    fireEvent.press(getByTestId("bpm-increase"));
    expect(onBpmChange).toHaveBeenCalledWith(125); // Increment by 5
  });

  it("displays difficulty selector", () => {
    const { getByTestId } = render(<SongMetadataForm {...defaultProps} />);

    expect(getByTestId("difficulty-selector")).toBeTruthy();
  });
});
