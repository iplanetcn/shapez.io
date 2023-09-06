// @ts-nocheck
const METADATA = {
    website: "",
    author: "WhiteTPoison",
    name: "Speed Control",
    version: "1",
    id: "speed-control",
    description: "Add the ability to speed up, slow down, and pause the game.",
    minimumGameVersion: ">=1.5.0",

    // You can specify this parameter if savegames will still work
    // after your mod has been uninstalled
    doesNotAffectSavegame: true,
};

class Mod extends shapez.Mod {
    init() {
        // Add fancy sign to main menu
        this.signals.stateEntered.add(state => {
            if (state.key === "InGameState") {
                const element = document.createElement("div");
                element.id = "ingame_HUD_SpeedControl";
                document.body.appendChild(element);

                const scrubBar = document.createElement("input");
                scrubBar.type = "range";
                scrubBar.id = "speed";
                scrubBar.name = "speed";
                scrubBar.min = "0.5";
                scrubBar.max = "2.0";
                scrubBar.step = "0.1";
                scrubBar.value = "1.0";

                var paused = false;

                const min = scrubBar.min;
                const max = scrubBar.max;
                const val = scrubBar.value;

                scrubBar.style.backgroundSize = (val - min) * 100 / (max - min) + '% 100%';

                const value = document.createElement("output");
                value.id = "speed-value";
                value.value = "1.0";

                scrubBar.addEventListener('input', (e) => {
                    var speed = scrubBar.value;
                    value.value = scrubBar.value;
                    let target = e.target;
                    if (e.target.type !== 'range') {
                        target = document.getElementById('range');
                    }
                    const min = target.min;
                    const max = target.max;
                    const val = target.value;

                    target.style.backgroundSize = (val - min) * 100 / (max - min) + '% 100%';
                    this.modInterface.replaceMethod(shapez.RegularGameSpeed, "getTimeMultiplier", function() {
                        return speed;
                    });
                    this.modInterface.extendClass(shapez.GameTime, ({ $old }) => ({
                        realtimeNow() {
                            if(!paused) {
                                return speed * this.realtimeSeconds;
                            }
                            else {
                                return 0;
                            }
                        }
                    }));
                });

                const pauseImg = document.createElement("img");
                pauseImg.src = IMAGES["pause"];
                pauseImg.id = "pause-image";

                const pauseButton = document.createElement("button");
                pauseButton.id = "pause-button"
                pauseButton.appendChild(pauseImg);
                pauseButton.addEventListener("click", () => {
                    if(pauseImg.src == IMAGES["pause"]) {
                        paused = true;
                        this.modInterface.replaceMethod(shapez.HUDSettingsMenu, "shouldPauseGame", function() {
                            return true;
                        });
                        this.modInterface.replaceMethod(shapez.RegularGameSpeed, "getTimeMultiplier", function() {
                            return 0;
                        });
                        this.modInterface.extendClass(shapez.GameTime, ({ $old }) => ({
                            realtimeNow() {
                                return 0;
                            }
                        }));
                        pauseImg.src = IMAGES["play"];
                    }
                    else {
                        paused = false;
                        this.modInterface.replaceMethod(shapez.HUDSettingsMenu, "shouldPauseGame", function() {
                            return false;
                        });
                        this.modInterface.replaceMethod(shapez.RegularGameSpeed, "getTimeMultiplier", function() {
                            return value.value;
                        });
                        this.modInterface.extendClass(shapez.GameTime, ({ $old }) => ({
                            realtimeNow() {
                                return value.value * this.realtimeSeconds;
                            }
                        }));
                        pauseImg.src = IMAGES["pause"];
                    }
                });


                element.appendChild(value);
                element.appendChild(scrubBar);
                element.appendChild(pauseButton);
            }
        });

        this.modInterface.registerCss(`
                #ingame_HUD_SpeedControl {
                    position: absolute;
                    top: calc(10px * var(--ui-scale));
                    left: 50%;
                    transform: translateX(-50%);
                    border-radius: calc(4px * var(--ui-scale));
                    background: #0002;
                    z-index: 300;
                }
                #pause-image {
                    height: calc(24px * var(--ui-scale));
                    width: calc(24px * var(--ui-scale));
                    object-fit: scale-down !important;
                }
                #pause-button {
                    positon: relative;
                    top: calc(10px * var(--ui-scale));
                    right: calc(5px * var(--ui-scale));
                }
                input[type="range"] {
                    -webkit-appearance: none;
                    margin-right: 15px;
                    width: calc(200px * var(--ui-scale));
                    height: calc(7px * var(--ui-scale));
                    background: rgba(255, 255, 255, 0.6);
                    border-radius: 5px;
                    background-image: linear-gradient(#64666E, #64666E);
                    background-size: 70% 100%;
                    background-repeat: no-repeat;
                }
                input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    height: calc(20px * var(--ui-scale));
                    width: calc(20px * var(--ui-scale));
                    border-radius: 50%;
                    background: #64666E;
                    cursor: ew-resize;
                    box-shadow: 0 0 2px 0 #555;
                    transition: background .3s ease-in-out;
                }
                input[type="range"]::-moz-range-thumb {
                    -webkit-appearance: none;
                    height: calc(20px * var(--ui-scale));
                    width: calc(20px * var(--ui-scale));
                    border-radius: 50%;
                    background: #64666E;
                    cursor: ew-resize;
                    box-shadow: 0 0 2px 0 #555;
                    transition: background .3s ease-in-out;
                }
                input[type="range"]::-ms-thumb {
                    -webkit-appearance: none;
                    height: calc(20px * var(--ui-scale));
                    width: calc(20px * var(--ui-scale));
                    border-radius: 50%;
                    background: #64666E;
                    cursor: ew-resize;
                    box-shadow: 0 0 2px 0 #555;
                    transition: background .3s ease-in-out;
                }
                input[type="range"]::-webkit-slider-thumb:hover {
                    background: #505258;
                }

                input[type="range"]::-moz-range-thumb:hover {
                    background: #505258;
                }

                input[type="range"]::-ms-thumb:hover {
                    background: #505258;
                }
                input[type=range]::-webkit-slider-runnable-track  {
                    -webkit-appearance: none;
                    box-shadow: none;
                    border: none;
                    background: transparent;
                }
                input[type=range]::-moz-range-track {
                    -webkit-appearance: none;
                    box-shadow: none;
                    border: none;
                    background: transparent;
                }
                input[type="range"]::-ms-track {
                    -webkit-appearance: none;
                    box-shadow: none;
                    border: none;
                    background: transparent;
                }
                #speed-value {
                    position: relative;
                    margin-right: calc(5px * var(--ui-scale));
                    display: inline-block;
                    vertical-align: middle;
                    border-radius: calc(3px * var(--ui-scale));
                    border: calc(1px * var(--ui-scale)) solid #64666E;
                    background: #DEE1EA;
                    width: calc(24px * var(--ui-scale));
                    height: calc(24px * var(--ui-scale));
                }
            `);
    }
}

////////////////////////////////////////////////////////////////////////

const IMAGES = {
    "pause": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMjAgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMC4wIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRpY29ucywgSW5jLiAtLT48cGF0aCBkPSJNMjcyIDYzLjFsLTMyIDBjLTI2LjUxIDAtNDggMjEuNDktNDggNDcuMXYyODhjMCAyNi41MSAyMS40OSA0OCA0OCA0OEwyNzIgNDQ4YzI2LjUxIDAgNDgtMjEuNDkgNDgtNDh2LTI4OEMzMjAgODUuNDkgMjk4LjUgNjMuMSAyNzIgNjMuMXpNODAgNjMuMWwtMzIgMGMtMjYuNTEgMC00OCAyMS40OS00OCA0OHYyODhDMCA0MjYuNSAyMS40OSA0NDggNDggNDQ4bDMyIDBjMjYuNTEgMCA0OC0yMS40OSA0OC00OHYtMjg4QzEyOCA4NS40OSAxMDYuNSA2My4xIDgwIDYzLjF6Ii8+PC9zdmc+",
    "play": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzODQgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMC4wIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRpY29ucywgSW5jLiAtLT48cGF0aCBkPSJNMzYxIDIxNUMzNzUuMyAyMjMuOCAzODQgMjM5LjMgMzg0IDI1NkMzODQgMjcyLjcgMzc1LjMgMjg4LjIgMzYxIDI5Ni4xTDczLjAzIDQ3Mi4xQzU4LjIxIDQ4MiAzOS42NiA0ODIuNCAyNC41MiA0NzMuOUM5LjM3NyA0NjUuNCAwIDQ0OS40IDAgNDMyVjgwQzAgNjIuNjQgOS4zNzcgNDYuNjMgMjQuNTIgMzguMTNDMzkuNjYgMjkuNjQgNTguMjEgMjkuOTkgNzMuMDMgMzkuMDRMMzYxIDIxNXoiLz48L3N2Zz4="
};