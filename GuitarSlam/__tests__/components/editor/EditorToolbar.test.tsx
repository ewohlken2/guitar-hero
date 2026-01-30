import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { EditorToolbar } from "../../../src/components/editor/EditorToolbar";

describe("EditorToolbar", () => {
  const defaultProps = {
    canUndo: true,
    canRedo: true,
    snapToGrid: false,
    zoom: 1,
    onUndo: jest.fn(),
    onRedo: jest.fn(),
    onToggleSnap: jest.fn(),
    onZoomIn: jest.fn(),
    onZoomOut: jest.fn(),
    onPreview: jest.fn(),
    onSave: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders undo/redo buttons", () => {
    const { getByTestId } = render(<EditorToolbar {...defaultProps} />);

    expect(getByTestId("undo-button")).toBeTruthy();
    expect(getByTestId("redo-button")).toBeTruthy();
  });

  it("disables undo when canUndo is false", () => {
    const { getByTestId } = render(
      <EditorToolbar {...defaultProps} canUndo={false} />,
    );

    const undoButton = getByTestId("undo-button");
    expect(undoButton.props.accessibilityState.disabled).toBe(true);
  });

  it("disables redo when canRedo is false", () => {
    const { getByTestId } = render(
      <EditorToolbar {...defaultProps} canRedo={false} />,
    );

    const redoButton = getByTestId("redo-button");
    expect(redoButton.props.accessibilityState.disabled).toBe(true);
  });

  it("calls onUndo when undo is pressed", () => {
    const onUndo = jest.fn();
    const { getByTestId } = render(
      <EditorToolbar {...defaultProps} onUndo={onUndo} />,
    );

    fireEvent.press(getByTestId("undo-button"));
    expect(onUndo).toHaveBeenCalled();
  });

  it("calls onToggleSnap when snap button is pressed", () => {
    const onToggleSnap = jest.fn();
    const { getByTestId } = render(
      <EditorToolbar {...defaultProps} onToggleSnap={onToggleSnap} />,
    );

    fireEvent.press(getByTestId("snap-button"));
    expect(onToggleSnap).toHaveBeenCalled();
  });

  it("shows snap active state", () => {
    const { getByTestId } = render(
      <EditorToolbar {...defaultProps} snapToGrid={true} />,
    );

    const snapButton = getByTestId("snap-button");
    expect(snapButton.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: expect.any(String) }),
      ]),
    );
  });

  it("calls onPreview when preview button is pressed", () => {
    const onPreview = jest.fn();
    const { getByTestId } = render(
      <EditorToolbar {...defaultProps} onPreview={onPreview} />,
    );

    fireEvent.press(getByTestId("preview-button"));
    expect(onPreview).toHaveBeenCalled();
  });

  it("calls onSave when save button is pressed", () => {
    const onSave = jest.fn();
    const { getByTestId } = render(
      <EditorToolbar {...defaultProps} onSave={onSave} />,
    );

    fireEvent.press(getByTestId("save-button"));
    expect(onSave).toHaveBeenCalled();
  });
});
