import { useCallback, useEffect } from "react";
import { focusFirst, isArrow, isBackKey, moveFocus } from "../focus/spatial";

export { focusFirst, moveFocus };

interface RemoteKeysOptions {
  saverOn: boolean;
  sheetOpen: boolean;
  contOpen: boolean;
  onExitSaver: () => void;
  onCloseSheet: () => void;
  onCloseCont: () => void;
  onOpenCont: () => void;
  onActivity: () => void;
}

/** 首页专用：继续观看行、壁纸面板、屏保的按键优先级。 */
export function useRemoteKeys(options: RemoteKeysOptions) {
  const {
    saverOn,
    sheetOpen,
    contOpen,
    onExitSaver,
    onCloseSheet,
    onCloseCont,
    onOpenCont,
    onActivity,
  } = options;

  const isBack = useCallback((key: string) => isBackKey(key), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      if (isArrow(key) || key === "Enter" || key === " ") onActivity();

      if (saverOn) {
        event.preventDefault();
        onExitSaver();
        return;
      }

      if (sheetOpen) {
        if (isBack(key)) {
          event.preventDefault();
          onCloseSheet();
          return;
        }
        if (isArrow(key)) {
          event.preventDefault();
          moveFocus(key);
        }
        return;
      }

      if (contOpen) {
        if (isBack(key) || key === "ArrowDown") {
          event.preventDefault();
          onCloseCont();
          return;
        }
        if (key === "ArrowUp") {
          event.preventDefault();
          return;
        }
        if (isArrow(key)) {
          event.preventDefault();
          moveFocus(key);
        }
        return;
      }

      if (key === "ArrowUp") {
        event.preventDefault();
        onOpenCont();
        return;
      }

      if (isArrow(key)) {
        event.preventDefault();
        moveFocus(key);
      }
    };

    const onPointer = () => onActivity();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointer, { passive: true });
    window.addEventListener("wheel", onPointer, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("wheel", onPointer);
    };
  }, [
    saverOn,
    sheetOpen,
    contOpen,
    onExitSaver,
    onCloseSheet,
    onCloseCont,
    onOpenCont,
    onActivity,
    isBack,
  ]);
}
