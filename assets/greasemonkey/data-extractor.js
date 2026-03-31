// ==UserScript==
// @name        Milovana: Data Extractor
// @namespace   wompi72
// @author      wompi72
// @version     1.1.1
// @description Extract data from teases
// @match       https://milovana.com/*
// @grant       none
// @license     MIT
// @downloadURL https://update.greasyfork.org/scripts/561423/Milovana%3A%20Data%20Extractor.user.js
// @updateURL https://update.greasyfork.org/scripts/561423/Milovana%3A%20Data%20Extractor.meta.js
// ==/UserScript==

function displayJsonData(data) {
    function formatValue(v) {
        if (typeof v !== "number" || Math.abs(v) < 1000) {
            return v;
        }

        const thousands = Math.floor(Math.log10(Math.abs(v)) / 3);
        const base = Math.floor(v / 1000 ** thousands);

        return `${base}${"k".repeat(thousands)}`;
    }
    const displayData = Object.entries(data)
        .filter(([k]) => k !== 'page_names')
        .map(([k, v]) => `${k}: ${formatValue(v)}`)
        .join(", ");
    return displayData;
}

(function() {
    'use strict';

    class DataScraper {
        cached_data = {}

        init() {
            this.cached_data = JSON.parse(localStorage.getItem("TeaseDataData") || "{}")
        }
        downloadJson(teaseId, teaseTitle) {
            const jsonSourceUrl = this.getJsonSourceUrl(teaseId)
            fetch(jsonSourceUrl).then(res => res.blob()).then(blob => {
                const fileName = teaseTitle.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
                const fullFileName = `${fileName}.json`;
                this._download(blob, fullFileName);
            });
        }
        downloadSimplifiedJson(teaseId, teaseTitle) {
            const jsonSourceUrl = this.getJsonSourceUrl(teaseId)
            fetch(jsonSourceUrl).then(res => res.json()).then(jsonData => {
                let parserClass;
                if ("galleries" in jsonData) {
                    parserClass = new EOSTeaseSimplifier()
                } else {
                    parserClass = new FlashTeaseSimplifier()
                }
                const simplifiedData = parserClass.parseData(jsonData);

                const fileName = teaseTitle.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
                const fullFileName = `${fileName}_simplified.json`;
                const jsonString = JSON.stringify(simplifiedData, null, 4);
                const blob = new Blob([jsonString], { type: 'application/json' });
                this._download(blob, fullFileName);
            });
        }

        getSimplifiedJson(teaseId, callback) {
            const jsonSourceUrl = this.getJsonSourceUrl(teaseId)
            fetch(jsonSourceUrl).then(res => res.json()).then(jsonData => {
                let parserClass;
                if ("galleries" in jsonData) {
                    parserClass = new EOSTeaseSimplifier()
                } else {
                    parserClass = new FlashTeaseSimplifier()
                }
                callback(teaseId, parserClass.parseData(jsonData));
            });
        }

        save_data(data, teaseId) {
            this.cached_data[teaseId] = data
            localStorage.setItem("TeaseDataData", JSON.stringify(this.cached_data))
        }
        get_data(teaseId) {
            return this.cached_data[teaseId] || null
        }

        async getTeaseSummary(teaseId) {
            const url = this.getJsonSourceUrl(teaseId);
            const res = await fetch(url);
            if (!res.ok) {
                console.error(res);
                return
            }
            let data = await res.json();
            let summary;
            if ("galleries" in data) {
                summary = new EOSTeaseSimplifier().summarizeData(data);
            } else {
                summary = new FlashTeaseSimplifier().summarizeData(data);
            }

            this.save_data(summary, teaseId)
            return summary;
        }

        getJsonSourceUrl(teaseId) {
            return `https://milovana.com/webteases/geteosscript.php?id=${teaseId}`;
        }

        _download(jsonData, fileName) {
            const url = window.URL.createObjectURL(jsonData);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }

    const scraper = new DataScraper();
    scraper.init()

    const TEASE_TYPES = {
        EOS: "EOS",
        FLASH: "FLASH",
    }

    class DisplayData {
        display() {
            this.addCSS()
            document.querySelectorAll(".tease").forEach(teaseEl => {
                try {
                    this.addDisplay(teaseEl)
                } catch (error) {
                    console.error(`Error processing tease element: ${error.message}`);
                }
            })
        }

        addDisplay(teaseEl) {
            const bubbleEl = teaseEl.querySelector(".bubble");
            const titleEl = bubbleEl.querySelector("h1 a");
            const teaseId = titleEl.href.match(/id=(\d+)/)[1];
            const teaseTitle = titleEl.textContent;
            const teaseTypeImg = titleEl.querySelector("img");
            if (teaseTypeImg==null) return;

            let teaseType;
            if (teaseTypeImg.classList.contains("eosticon")) {
                teaseType = TEASE_TYPES.EOS
            } else if (teaseTypeImg.classList.contains("flashticon")) {
                teaseType = TEASE_TYPES.FLASH
            } else {
                return;
            }

            const parentContainerEl= this._createDiv(["flex-row", "data-buttons-container"], bubbleEl);
            const dataContainerEl = this._createDiv(["data-display"], parentContainerEl);
            const buttonContainerEl = this._createDiv(["data-display"], parentContainerEl);
            if (scraper.get_data(teaseId) != null) {
                this._displayData(scraper.get_data(teaseId), dataContainerEl)
            }

            this._createButton("Json", ["data-button", "tease_data_button"], buttonContainerEl, () => {
                scraper.downloadJson(teaseId, teaseTitle)
            });
            this._createButton("Simple", ["data-button", "tease_data_button"], buttonContainerEl, () => {
                scraper.downloadSimplifiedJson(teaseId, teaseTitle)
            });
            this._createButton("Summary", ["parse-data-button", "tease_data_button"], buttonContainerEl, async () => {
                buttonContainerEl.querySelector(".parse-data-button").disabled = true;
                const data = await scraper.getTeaseSummary(teaseId);
                this._displayData(data, dataContainerEl);
            });
            this._createButton("Viewer", ["flow-graph-button", "tease_data_button"], buttonContainerEl, async () => {
                scraper.getSimplifiedJson(teaseId, new ConnectionMapper().showSimplifiedTease)
            });
        }

        _createDiv(classes, parent) {
            const div = document.createElement("div");
            div.classList.add(...classes);
            parent.appendChild(div);
            return div;
        }
        _createButton(text, classes, parent, onClick) {
            const button = document.createElement("button");
            button.textContent = text;
            button.addEventListener("click", onClick);
            button.classList.add(...classes);
            parent.appendChild(button);
            return button;
        }

        addCSS() {
            const style = document.createElement('style');
            style.textContent = `
.tease .bubble {
    height: unset !important;
    min-height: 100px;
}
.tease .bubble .desc {
    min-height: 60px;
}
.tease .info .tags {
    margin-left: 155px;
}
.flex-row {
    display: flex;
}
.data-buttons-container {
    justify-content: space-between;
    height: 1.0rem;
    font-size: 0.5rem;
}
.tease_data_button  {
    background-color: #a36666;
    color: #ffffff;
    border: none;
    border-radius: 2px;
    padding: 2px 4px;
    cursor: pointer;
    transition: opacity 0.2s;
    margin: 0 2px;
}
#mv-sidebar button:hover {
    opacity: 0.9;
}
#mv-sidebar button:active {
    transform: translateY(1px);
}
.data-display {
    margin: auto 0;
}
    `
            document.head.appendChild(style);
        }

        _displayData(data, dataContainerEl) {
            dataContainerEl.innerText = displayJsonData(data);
        }
    }

    function isEmpty(value) {
        if (Array.isArray(value) && value.length === 0) return true;
        return value === null || value === undefined || value == "";
    }

    class EOSTeaseSimplifier {
        constructor() {
            this.htmlPattern = /<\/?(strong|span|p|em|b|i|u)(?:\s+[^>]*)?>/gi;
            this.scriptNewlinePattern = /(\\r)*(\\n)+/g;
        }

        parseData(rawData) {
            const pageData = { ...rawData.pages };

            let initScript = this.preParseInitScripts(rawData.init || "");
            if (!isEmpty(initScript)) {
                pageData["__init_scripts"] = initScript;
            }

            let galleries = rawData.galleries || "";
            if (!isEmpty(galleries)) {
                this.galleries = this.parse_galleries(galleries);
            } else {
                this.galleries = {};
            }

            const sortedEntries = Object.entries(pageData).sort((a, b) => {
                const naturalSort = (str) => str.replace(/\d+/g, (m) => m.padStart(10, '0'));
                return naturalSort(a[0]).localeCompare(naturalSort(b[0]));
            });

            const sortedPageData = Object.fromEntries(sortedEntries);

            return this.parsePages(sortedPageData);
        }

        parse_galleries(galleries) {
            const out = {};
            for (const [gallery_id, gallery_data] of Object.entries(galleries)) {
                out[gallery_id] = `${gallery_data.name} (Image not found in gallery)`

                for (const [i, image_data] of gallery_data.images.entries()) {
                    out[`${gallery_id}/${image_data.id}`] = `${gallery_data.name} (${i + 1})`
                }
            }
            return out;
        }

        parsePages(pages) {
            return this.parseElement(pages)
        }

        parseElement(inData) {
            if (Array.isArray(inData)) {
                return this.parseList(inData);
            } else if (inData !== null && typeof inData === 'object') {
                return this.parseDict(inData);
            } else {
                return inData;
            }
        }

        parseDict(inData) {
            if ("say" in inData) {
                let text = inData.say.label || "";
                return this.parseText(text);
            }

            if ("eval" in inData) {
                return `> SCRIPT:${inData.eval.script}`;
            }

            if ("image" in inData) {
                try {
                    const locator = inData.image.locator.replace(/^gallery:/, '');
                    if (this.galleries.hasOwnProperty(locator)) return `> Image: ${this.galleries[locator]}`;
                    const gallery_id = locator.split("/")[0];
                    if (this.galleries.hasOwnProperty(gallery_id)) return `> Image: ${this.galleries[gallery_id]}`;
                } catch (e) {
                    console.error(e);
                }
                return "Image";
            }

            if ("goto" in inData) {
                return `> GOTO:${inData.goto.target}`;
            }

            if ("timer" in inData) {
                const timerData = inData.timer;

                return this.parseTimer(timerData);
            }

            if ("if" in inData) {
                const ifData = inData.if;
                if (ifData.condition === "true" && isEmpty(ifData.elseCommands)) {
                    return this.parseElement(ifData.commands);
                }
                const out = {
                    [`If (${ifData.condition})`]: this.parseElement(ifData.commands)
                };
                if (ifData.elseCommands) {
                    out["else"] = this.parseElement(ifData.elseCommands);
                }
                return out;
            }

            if ("choice" in inData) {
                const options = inData.choice.options || [];
                return this.parseChoices(options);
            }

            if ("audio.play" in inData) {
                const suffix = "loops" in inData["audio.play"] && inData["audio.play"].loops > 0 ? ` (${inData["audio.play"].loops} loops)` : "";

                return `> Audio: ${inData["audio.play"].locator}${suffix}`;
            }
            if ("prompt" in inData) {
                return `> Prompt: ${inData.prompt.variable}`
            }

            const outData = {};
            for (const [key, value] of Object.entries(inData)) {
                outData[key] = this.parseElement(value);
            }
            return outData;
        }

        parseTimer(timerData) {
            let key = `> Timer ${timerData.duration}`;
            if (timerData.style) key += ` (${timerData.style})`;
            if (timerData.isAsync) key += " (async)";

            const commands = this.parseElement(timerData.commands || []);
            if (isEmpty(commands)) {
                return key;
            }
            if (commands.length === 1) {
                return `${key} -${commands[0]}`;
            }
            return {[key]: commands};
        }

        parseText(text) {
            let cleaned = text.replace(this.htmlPattern, '');
            return cleaned.replace(/&#39;/g, "'").replace(/&apos;/g, "'").replace(/&quot;/g, "'");
        }

        parseList(inData) {
            const out = [];
            for (const element of inData) {
                const parsed = this.parseElement(element);
                if (parsed === "Image" || isEmpty(parsed)) continue;
                out.push(parsed);
            }
            return out;
        }

        parseChoices(options) {
            const out = {};
            options.forEach(option => {
                out[`Choice: ${option.label}`] = this.parseElement(option.commands);
            });

            const values = Object.values(out);
            const labels = options.map(o => o.label).join(', ');

            if (values.length === 0 || values.every(v => isEmpty(v))) {
                return `> Choice: ${labels}`;
            }
            if (values.length === 1 && values[0].length === 1) {
                return `> Choice: ${labels} -${values[0]}`;
            }
            if (values.every(v => JSON.stringify(v) === JSON.stringify(values[0]))) {
                return {[`Choice: ${labels}`]: values[0]};
            }
            if (values.every(v => v.length === 1)) {
                const outList = []
                for (const [key, value] of Object.entries(out)) {
                    outList.push(`> ${key} -${value[0]}`);
                }
                return outList;
            }

            return out;
        }

        preParseInitScripts(script) {
            if (isEmpty(script)) return [];
            const normalized = script.replace(this.scriptNewlinePattern, "\n");
            return normalized.split("\n").filter(line => line.trim() !== "");
        }

        summarizeData(data) {
            const parsed = {
                pages: 0,
                words: 0,
                scriptWords: 0,
                meaningfulChoices: 0,
                storage: false,
                page_names: []
            }
            for (const [name, page] of Object.entries(data.pages)) {
                parsed.pages += 1;
                parsed.page_names.push(name);
                this._summarizePage(page, parsed);
            }
            this._summarizeScript(data.init || "", parsed)
            return parsed;
        }

        _summarizePage(page, parsed) {
            return this._summarizeData(page, parsed);
        }

        _summarizeData(inData, parsed) {
            if (Array.isArray(inData)) {
                for (const item of inData) {
                    this._summarizeData(item, parsed);
                }
                return;
            }
            if (typeof inData !== "object") return;
            this._summarizeDict(inData, parsed);
        }


        _summarizeDict(inData, parsed) {
            if (Object.hasOwn(inData, "say")) {
                parsed.words += inData.say.label.split(" ").length;
            } else if (Object.hasOwn(inData, "choice")) {
                this._summarizeBranches(inData.choice.options, parsed);
            } else if (Object.hasOwn(inData, "if")) {
                const ifData = [{
                    commands: inData.if.commands,
                }]
                if (Object.hasOwn(inData.if, "elseCommands")) {
                    ifData.push({
                        commands: inData.if.elseCommands,
                    })
                }
                this._summarizeBranches(ifData, parsed, false, inData.if.condition == "true");
            } else if (Object.hasOwn(inData, "eval")) {
                this._summarizeScript(inData.eval.script, parsed);
            }
        }
        _summarizeBranches(choices, parsed, checkAtLeastTwo=true, isNotMeaningful=false) {
            let meaningfulChoicesFound = false;
            for (const choice of choices) {
                this._summarizeData(choice.commands, parsed);
                if (!isNotMeaningful && meaningfulChoicesFound || (checkAtLeastTwo && choices.length < 2)) continue;
                if (this._hasRelevantChoice(choice.commands)) {
                    meaningfulChoicesFound = true;
                }
            }

            if (!isNotMeaningful && meaningfulChoicesFound) {
                parsed.meaningfulChoices += 1;
            }
        }

        _hasRelevantChoice(choiceResults) {
            for (const command of choiceResults) {
                if (Object.hasOwn(command, "goto") || Object.hasOwn(command, "eval")){
                    return  true;
                }
            }
            return false
        }

        _summarizeScript(script, parsed) {
            if (script.includes("teaseStorage")) {
                parsed.storage = true;
            }
            script = script.replace(/\r\n?|\n/g, "\n");

            // Remove comments while preserving string literals
            script = script.replace(
                /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|\/\/.*|\/\*[\s\S]*?\*\//g,
                (match, stringLiteral) => (stringLiteral ? stringLiteral : "")
            );

            // Count words (alphanumeric + underscore)
            const words = script.match(/\b[A-Za-z0-9_]+\b/g);
            parsed.scriptWords += words ? words.length : 0;
        }

    }

    class FlashTeaseSimplifier extends EOSTeaseSimplifier {
        parsePages(pages) {
            const out = {};
            for (const [key, value] of Object.entries(pages)) {
                if (value.length > 1) {
                    out[key] = this.parseElement(value);
                } else {
                    out[key] = this.parseElement(value[0]);
                }
            }
            return out;
        }

        parseDict(inData) {
            if (isEmpty(inData)) {return null}

            if ("nyx.page" in inData) {
                const pageData = inData["nyx.page"];
                const parsedPage = [];
                if ("media" in pageData) {
                    parsedPage.push(
                        this.parseElement(pageData.media)
                    )
                }
                parsedPage.push(this.parseText(pageData.text));
                if ("action" in pageData) {
                    parsedPage.push(
                        this.parseElement(pageData.action)
                    )
                }
                return parsedPage;
            }

            if ("nyx.buttons" in inData) {
                const options = inData["nyx.buttons"] || [];
                return this.parseChoices(options);
            }

            if ("nyx.vert" in inData) {
                return this.parseElement(inData["nyx.vert"].elements);
            }

            if ("goto" in inData) {
                return `> GOTO:${inData.goto.target}`;
            }

            if ("nyx.timer" in inData) {
                const timerData = inData["nyx.timer"];
                try {
                    const durationStr = timerData.duration;
                    const ms = parseInt(durationStr);
                    timerData.duration = this.formatDurationMs(ms);
                } catch (e) {}

                return this.parseTimer(timerData);
            }

            if ("nyx.image" in inData) {
                const imageLocator = inData["nyx.image"];

                return `> Image: ${imageLocator.replace(/^file:/, '')}`;
            }

            const outData = {};
            for (const [key, value] of Object.entries(inData)) {
                outData[key] = this.parseElement(value);
            }
            return outData;
        }

        _summarizePage(page, parsed) {
            if (page.length > 1) {
                return this._summarizeData(page, parsed);
            } else {
                return this._summarizeData(page[0], parsed);
            }
        }

        _summarizeDict(inData, parsed) {
            if ("nyx.page" in inData) {
                const pageData = inData["nyx.page"];

                parsed.words += pageData.text.split(" ").length;
                if ("action" in pageData) {
                    this._summarizeDict(pageData.action, parsed);
                }
                return;
            }

            if ("nyx.buttons" in inData) {
                const options = this._summaryButtonOptions(inData["nyx.buttons"]);
                this._summarizeOptions(options, parsed);
            }
            if ("nyx.vert" in inData) {
                const options = []
                for (const element of inData["nyx.vert"].elements) {
                    if ("nyx.buttons" in element) {
                        options.push(...this._summaryButtonOptions(element["nyx.buttons"]));
                    }
                    if ("nyx.timer" in element) {
                        options.push(element["nyx.timer"].commands[0].goto.target)
                    }
                }
                this._summarizeOptions(options, parsed);
            }
        }

        _summaryButtonOptions(buttonOptions) {
            const options = []
            for (const option of buttonOptions) {
                options.push(option.commands[0].goto.target);
            }
            return options;
        }

        _summarizeOptions(options, parsed) {
            if (options.length <= 1) {
                return;
            }
            if (options.every(v => JSON.stringify(v) === JSON.stringify(options[0]))) {
                return;
            }
            parsed.meaningfulChoices += 1;
        }

        formatDurationMs(ms) {
            const totalSeconds = Math.floor(ms / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            const parts = [];
            if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
            if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
            if (seconds > 0) parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);

            return parts.length > 0 ? parts.join(' ') : '0 seconds';
        }
    }

    class ConnectionMapper {
        static teaseId;

        constructor() {
            this.modal = null;
            this.selectedCard = null;
            this.showAlternateArrows = false;
            this.showFullBodyInCards = this.loadFullBodyPreference();
            this.showChronological = this.loadChronologicalPreference();
        }

        addCSS() {
            const style = document.createElement('style');
            style.textContent = `
            .cm-modal {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 95vw;
                height: 95vh;
                background: #f2cfcf;
                border: 2px solid #6671a3;
                border-radius: 8px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            }
            .cm-header {
                background: #6671a3;
                color: white;
                padding: 12px 16px;
                border-bottom: 1px solid #555;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-weight: bold;
                gap: 20px;
            }
            .cm-header-controls {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .cm-checkbox {
                margin-right: 6px;
                cursor: pointer;
                accent-color: #a36666;
            }
            .cm-checkbox-label {
                color: white;
                font-size: 12px;
                margin: 0;
                cursor: pointer;
            }
            .cm-body {
                display: flex;
                flex: 1;
                overflow: hidden;
            }
            .cm-cards-panel {
                flex: 1;
                overflow-y: auto;
                padding: 16px;
                display: flex;
                flex-wrap: wrap;
                gap: 16px;
                align-content: flex-start;
                border-right: 2px solid #ddd;
            }
            .cm-cards-panel.chronological {
                display: flex;
                flex-direction: column;
                gap: 8px;
                align-content: unset;
                flex-wrap: nowrap;
            }
            .cm-card-row {
                display: flex;
                gap: 16px;
                flex-wrap: wrap;  
                justify-content: space-around;
                border-bottom: 2px solid #a36666;
            }
            .cm-details-panel {
                width: 50%;
                max-width: 40rem;
                padding: 16px;
                overflow-y: auto;
                border-left: 2px solid #ddd;
                display: flex;
                flex-direction: column;
            }
            .cm-full-body-mode .cm-details-panel {
                width: 8rem;
            }
            .cm-full-body-mode .cm-detail-section-body {
                display: none;
            }
            .cm-card {
                background: white;
                border: 2px solid #a36666;
                border-radius: 6px;
                min-width: 160px;
                cursor: pointer;
                transition: all 0.2s;
                overflow: hidden;
            }
            .cm-card:hover {
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                transform: translateY(-2px);
            }
            .cm-card.selected {
                border-color: #a36666;
                background: #a36666;
                box-shadow: 0 0 8px rgba(102, 113, 163, 0.4);
                color: #dbdbdb;
            }
            .cm-card.connected {
                background: #99a0be;
                border-color: #99a0be;
                box-shadow: 0 0 6px rgba(212, 165, 116, 0.3);
            }
            .cm-card.connected-alt {
                background: yellowgreen;
                border-color: yellowgreen;
                box-shadow: 0 0 6px rgba(212, 165, 116, 0.3);
                color: white;
            }
            .cm-card-header {
                background: #eebfb8;
                padding: 5px;
                font-weight: bold;
                color: #333;
                text-align: center;
            }
            .cm-card-preview {
                padding: 8px;
                font-size: 11px;
                max-height: 60px;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .cm-card-preview.full-body {
                max-height: 300px;
                max-width: 30rem;
                overflow-y: auto;
                white-space: pre-wrap;
                word-break: break-word;
            }
            .cm-details-title {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 18px;
                font-weight: bold;
                color: #333;
                margin-bottom: 12px;
                padding-bottom: 8px;
                border-bottom: 2px solid #a36666;
            }
            .cm-details-section {
                margin-bottom: 12px;
            }
            .cm-section-label {
                font-weight: bold;
                color: #333;
                font-size: 12px;
                margin-bottom: 4px;
            }
            .cm-section-content {
                background: #f5f5f5;
                padding: 8px;
                border-radius: 4px;
                font-size: 12px;
                line-height: 1.5;
            }
            .cm-link {
                color: #6671a3;
                cursor: pointer;
                text-decoration: underline;
                margin-right: 6px;
                transition: color 0.2s;
            }
            .cm-link:hover {
                color: #a36666;
            }
            .cm-missing {
                color: #d32f2f;
                font-weight: bold;
            }
            .cm-btn {
                background: #a36666;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 6px 12px;
                cursor: pointer;
                font-size: 12px;
            }
            .cm-btn:hover {
                opacity: 0.9;
            }
        `;
            document.head.appendChild(style);
        }

        show(data) {
            this.data = data;
            this.addCSS();

            this.modal = document.createElement('div');
            this.modal.className = 'cm-modal';

            // Header
            const header = document.createElement('div');
            header.className = 'cm-header';

            const title = document.createElement('span');
            title.textContent = 'Viewer';

            const controls = document.createElement('div');
            controls.className = 'cm-header-controls';

            const checkboxContainer = document.createElement('label');
            checkboxContainer.className = 'cm-checkbox-label';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'cm-checkbox';
            checkbox.addEventListener('change', (e) => {
                this.showAlternateArrows = e.target.checked;
                this.updateCardHighlights();
            });
            checkboxContainer.appendChild(checkbox);
            checkboxContainer.appendChild(document.createTextNode('Show Guessed Connections'));

            // Checkbox for showing full body in cards
            const fullBodyContainer = document.createElement('label');
            fullBodyContainer.className = 'cm-checkbox-label';
            const fullBodyCheckbox = document.createElement('input');
            fullBodyCheckbox.type = 'checkbox';
            fullBodyCheckbox.className = 'cm-checkbox';
            fullBodyCheckbox.checked = this.showFullBodyInCards;
            if (this.showFullBodyInCards) {
                this.modal.classList.add('cm-full-body-mode');
            }
            fullBodyCheckbox.addEventListener('change', (e) => {
                this.showFullBodyInCards = e.target.checked;
                this.saveFullBodyPreference(this.showFullBodyInCards);
                if (this.showFullBodyInCards) {
                    this.modal.classList.add('cm-full-body-mode');
                } else {
                    this.modal.classList.remove('cm-full-body-mode');
                }
                this.updateAllCardPreviews();
            });
            fullBodyContainer.appendChild(fullBodyCheckbox);
            fullBodyContainer.appendChild(document.createTextNode('Show Full Body'));

            // Checkbox for chronological display
            const chronoContainer = document.createElement('label');
            chronoContainer.className = 'cm-checkbox-label';
            const chronoCheckbox = document.createElement('input');
            chronoCheckbox.type = 'checkbox';
            chronoCheckbox.className = 'cm-checkbox';
            chronoCheckbox.checked = this.showChronological;
            chronoCheckbox.addEventListener('change', (e) => {
                this.showChronological = e.target.checked;
                this.saveChronologicalPreference(this.showChronological);
                this.refreshCardsPanel();
            });
            chronoContainer.appendChild(chronoCheckbox);
            chronoContainer.appendChild(document.createTextNode('Chronological Display'));

            const closeBtn = document.createElement('button');
            closeBtn.className = 'cm-close-btn cm-btn';
            closeBtn.textContent = 'Close';
            closeBtn.addEventListener('click', () => this.close());

            controls.appendChild(checkboxContainer);
            controls.appendChild(fullBodyContainer);
            controls.appendChild(chronoContainer);
            controls.appendChild(closeBtn);

            header.appendChild(title);
            header.appendChild(controls);
            this.modal.appendChild(header);

            // Body: two-panel layout
            const body = document.createElement('div');
            body.className = 'cm-body';

            // Left panel: Cards
            const cardsPanel = document.createElement('div');
            cardsPanel.className = 'cm-cards-panel';
            this.cardsPanel = cardsPanel;

            if (this.showChronological) {
                this.populateChronologicalCards(cardsPanel);
            } else {
                this.populateAlphabeticalCards(cardsPanel);
            }

            // Right panel: Details
            const detailsPanel = document.createElement('div');
            detailsPanel.className = 'cm-details-panel';
            this.detailsPanel = detailsPanel;

            body.appendChild(cardsPanel);
            body.appendChild(detailsPanel);
            this.modal.appendChild(body);

            document.body.appendChild(this.modal);

            // Select first card by default
            if (data.length > 0) {
                this.selectCard(data[0]);
            }
        }

        showSimplifiedTease(teaseId, simplifiedTease) {
            ConnectionMapper.teaseId = teaseId;
            const out = {}
            for (const [page, data] of Object.entries(simplifiedTease)) {
                if (data == null || typeof data[Symbol.iterator] !== "function") {
                    continue;
                }
                let json_data = [];

                for (const line of data) {
                    if (typeof line === 'string') {
                        json_data.push(line);
                    } else {
                        json_data.push(JSON.stringify(line, null, 2));
                    }
                }
                const data_str = json_data.join("\n")
                const page_parsed = {
                    id: page,
                    body: data_str,
                    connections_raw: [],
                    connections: [],
                    guessed_connections: [],
                    missing_connections: [],
                    incoming_connections: [],
                    incoming_guessed_connections: [],
                };
                for (const match of data_str.matchAll(/> GOTO:([^\s"]+)/g)) {
                    const redirect = match[1].trim();
                    if (Object.hasOwn(simplifiedTease, redirect)) {
                        page_parsed.connections.push(redirect);
                        continue;
                    }
                    const guessed_connections = []
                    if (redirect.includes("*") || redirect.includes("$")) {
                        const regex = new RegExp(redirect.replace(/\*/g, ".*").replace(/\$(.*?)\s/g, "(.*?)"));
                        for (const [key, value] of Object.entries(simplifiedTease)) {
                            if (regex.test(key)) {
                                guessed_connections.push(key);
                            }
                        }
                    }
                    if (guessed_connections.length > 0) {
                        page_parsed.guessed_connections.push(...guessed_connections);
                    } else {
                        page_parsed.missing_connections.push(redirect);
                    }
                }

                out[page_parsed.id] = page_parsed
            }
            for (const page_data of Object.values(out)) {
                for (const connection of page_data.connections) {
                    out[connection].incoming_connections.push(page_data.id);
                }
                for (const connection of page_data.guessed_connections) {
                    out[connection].incoming_guessed_connections.push(page_data.id);
                }
            }

            const out2 = []
            for (const page_data of Object.values(out)) {
                out2.push(page_data)
            }

            new ConnectionMapper().show(out2);
        }

        createCard(item) {
            const card = document.createElement('div');
            card.className = 'cm-card';
            card.dataset.id = item.id;

            const header = document.createElement('div');
            header.className = 'cm-card-header';
            header.textContent = `>${item.id}`;

            const preview = document.createElement('div');
            preview.className = 'cm-card-preview';

            // Calculate lines count
            const lineCount = item.body ? item.body.split('\n').length : 0;

            // Calculate connection counts
            const connections = item.connections ? item.connections.length : 0;
            const missed = item.missing_connections ? item.missing_connections.length : 0;
            const guessed = item.guessed_connections ? item.guessed_connections.length : 0;

            card.dataset.item = JSON.stringify(item);

            this.updateCardPreviewContent(preview, item, lineCount, connections, missed, guessed);

            card.appendChild(header);
            card.appendChild(preview);

            card.addEventListener('click', () => this.selectCard(item));

            return card;
        }

        updateCardPreviewContent(preview, item, lineCount, connections, missed, guessed) {
            if (this.showFullBodyInCards && item.body) {
                preview.className = 'cm-card-preview full-body';
                preview.textContent = item.body;
            } else {
                preview.className = 'cm-card-preview';
                preview.textContent = `lines: ${lineCount}, connections: ${connections}|${missed}|${guessed}`;
            }
        }

        updateAllCardPreviews() {
            document.querySelectorAll('.cm-card').forEach(card => {
                const item = JSON.parse(card.dataset.item);
                const preview = card.querySelector('.cm-card-preview');
                const lineCount = item.body ? item.body.split('\n').length : 0;
                const connections = item.connections ? item.connections.length : 0;
                const missed = item.missing_connections ? item.missing_connections.length : 0;
                const guessed = item.guessed_connections ? item.guessed_connections.length : 0;
                this.updateCardPreviewContent(preview, item, lineCount, connections, missed, guessed);
            });
        }

        selectCard(item, scrollIntoView=false) {
            document.querySelectorAll('.cm-card').forEach(c => {
                c.classList.remove('selected');
            });
            const selectedCardElement = document.querySelector(`[data-id="${item.id}"]`);
            selectedCardElement?.classList.add('selected');

            if (scrollIntoView) {
                selectedCardElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
            }

            this.selectedCard = item;
            this.updateDetailsPanel(item);
            this.updateCardHighlights();
        }

        updateCardHighlights() {
            if (!this.selectedCard) return;

            // Clear all connection highlights
            document.querySelectorAll('.cm-card').forEach(c => {
                c.classList.remove('connected', 'connected-alt');
            });

            // Highlight connected cards
            if (this.selectedCard.connections) {
                this.selectedCard.connections.forEach(id => {
                    document.querySelector(`[data-id="${id}"]`)?.classList.add('connected');
                });
            }

            // Highlight alternate connections if enabled
            if (this.showAlternateArrows && this.selectedCard.guessed_connections) {
                this.selectedCard.guessed_connections.forEach(id => {
                    document.querySelector(`[data-id="${id}"]`)?.classList.add('connected-alt');
                });
            }
        }

        updateDetailsPanel(item) {
            this.detailsPanel.innerHTML = '';

            const titleRow = document.createElement('div');
            titleRow.className = 'cm-details-title';
            
            const titleText = document.createElement('span');
            titleText.textContent = item.id;
            titleRow.appendChild(titleText);
            if (ConnectionMapper.teaseId) {
                const reloadBtn = document.createElement('button');
                reloadBtn.className = 'cm-reload-btn cm-btn';
                reloadBtn.textContent = 'Go To Page';
                reloadBtn.addEventListener('click', () => {
                    if (window.location.href.includes('showtease.php') && !window.location.href.includes('preview')) {
                        if (confirm('Do you want to reload the tease in preview mode? All progress will be lost.')) {
                            window.location.href = `https://milovana.com/webteases/showtease.php?id=${ConnectionMapper.teaseId}&preview=1&page=${encodeURIComponent(item.id)}`;
                        } else {
                            return
                        }
                    }
                    window.location.href = `https://milovana.com/webteases/showtease.php?id=${ConnectionMapper.teaseId}&preview=1&page=${encodeURIComponent(item.id)}`;
                });
                titleRow.appendChild(reloadBtn);
            }
            this.detailsPanel.appendChild(titleRow);

            if (item.body) {
                const bodySection = document.createElement('div');
                bodySection.className = 'cm-details-section cm-detail-section-body';
                const label = document.createElement('div');
                label.className = 'cm-section-label';
                label.textContent = 'Body';
                const content = document.createElement('div');
                content.className = 'cm-section-content';
                const lines = item.body.split('\n');
                lines.forEach((line, idx) => {
                    const lineEl = document.createElement('div');
                    const preservedLine = line.replace(/^ +/, match => '&nbsp;'.repeat(match.length));
                    lineEl.innerHTML = preservedLine;
                    lineEl.style.wordBreak = 'break-word';
                    lineEl.style.whiteSpace = 'pre-wrap';
                    content.appendChild(lineEl);
                });
                bodySection.appendChild(label);
                bodySection.appendChild(content);
                this.detailsPanel.appendChild(bodySection);
            }

            const createConnectionSection = (data, label, isRaw = false, isMissing = false) => {
                if (!data || data.length === 0) return;

                const section = document.createElement('div');
                section.className = 'cm-details-section';
                const labelEl = document.createElement('div');
                labelEl.className = 'cm-section-label';
                labelEl.textContent = label;
                const content = document.createElement('div');
                content.className = `cm-section-content${isMissing ? ' cm-missing' : ''}`;

                if (isRaw) {
                    content.textContent = data.join(', ');
                } else {
                    const links = data.map(id => {
                        const link = document.createElement('span');
                        link.className = 'cm-link';
                        link.textContent = id;
                        link.addEventListener('click', () => {
                            const targetItem = this.data.find(d => d.id === id);
                            if (targetItem) this.selectCard(targetItem, true);
                        });
                        return link;
                    });
                    links.forEach((link, idx) => {
                        content.appendChild(link);
                        if (idx < links.length - 1) content.appendChild(document.createTextNode(' '));
                    });
                }

                section.appendChild(labelEl);
                section.appendChild(content);
                this.detailsPanel.appendChild(section);
            };

            createConnectionSection.call(this, item.connections, 'Connections');

            createConnectionSection.call(this, item.guessed_connections, 'Guessed Connections');

            createConnectionSection.call(this, item.missing_connections, 'Missing Connections', false, true);

            createConnectionSection.call(this, item.incoming_connections, 'In: Connections');

            createConnectionSection.call(this, item.incoming_guessed_connections, 'In: Guessed Connections');

            createConnectionSection.call(this, item.connections_raw, 'Pattern (Raw)', true);
        }

        loadFullBodyPreference() {
            const stored = localStorage.getItem('cm-show-full-body');
            return stored ? JSON.parse(stored) : false;
        }

        saveFullBodyPreference(value) {
            localStorage.setItem('cm-show-full-body', JSON.stringify(value));
        }

        loadChronologicalPreference() {
            const stored = localStorage.getItem('cm-chronological-display');
            return stored ? JSON.parse(stored) : true;
        }

        saveChronologicalPreference(value) {
            localStorage.setItem('cm-chronological-display', JSON.stringify(value));
        }

        populateAlphabeticalCards(cardsPanel) {
            this.data.forEach(item => {
                const card = this.createCard(item);
                cardsPanel.appendChild(card);
            });
        }

        populateChronologicalCards(cardsPanel) {
            cardsPanel.classList.add('chronological');
            const sortedData = this.buildChronologicalOrder();

            sortedData.forEach(row => {
                const rowDiv = document.createElement('div');
                rowDiv.className = 'cm-card-row';

                row.forEach(item => {
                    const card = this.createCard(item);
                    rowDiv.appendChild(card);
                });

                cardsPanel.appendChild(rowDiv);
            });
        }

        buildChronologicalOrder() {
            const rows = [];
            const displayed = new Set();
            const allIds = new Set(this.data.map(item => item.id));

            // Find start page (no incoming connections)
            const startPage = this.data.find(item => item.id === "start");
            let startPages;
            if (!startPage) {
                startPages = this.data.filter(item =>
                    item.incoming_connections.length === 0 &&
                    item.incoming_guessed_connections.length === 0
                );
            } else {
                startPages = [startPage];
            }

            // If no start pages found, use all data
            if (startPages.length === 0) {
                startPages = this.data;
            }

            // Add start pages to first row
            const firstRow = startPages.map(p => p.id);
            rows.push(this.getItemsById(firstRow, displayed));
            firstRow.forEach(id => displayed.add(id));

            // Build subsequent rows based on connections
            while (displayed.size < this.data.length) {
                const nextRow = this.buildNextRow(displayed, allIds);

                if (nextRow.length === 0) {
                    // No more connections found, add remaining pages
                    const remaining = this.data.filter(item => !displayed.has(item.id));
                    if (remaining.length > 0) {
                        rows.push(remaining);
                        remaining.forEach(item => displayed.add(item.id));
                    }
                    break;
                }

                rows.push(nextRow);
                nextRow.forEach(item => displayed.add(item.id));
            }

            return rows;
        }

        buildNextRow(displayed, allIds) {
            const nextRow = [];
            const candidates = new Set();

            // Find all pages that connect from already-displayed pages
            for (const id of displayed) {
                const item = this.data.find(d => d.id === id);
                if (item) {
                    // Add connections
                    if (this.showAlternateArrows) {
                        // Include guessed connections
                        item.connections.forEach(connId => {
                            if (!displayed.has(connId) && allIds.has(connId)) {
                                candidates.add(connId);
                            }
                        });
                        item.guessed_connections.forEach(connId => {
                            if (!displayed.has(connId) && allIds.has(connId)) {
                                candidates.add(connId);
                            }
                        });
                    } else {
                        // Only confirmed connections
                        item.connections.forEach(connId => {
                            if (!displayed.has(connId) && allIds.has(connId)) {
                                candidates.add(connId);
                            }
                        });
                    }
                }
            }

            // Convert candidates to items
            candidates.forEach(id => {
                const item = this.data.find(d => d.id === id);
                if (item) {
                    nextRow.push(item);
                }
            });

            return nextRow;
        }

        getItemsById(ids, displayed) {
            return ids.map(id => {
                const item = this.data.find(d => d.id === id);
                displayed.add(id);
                return item;
            }).filter(item => item !== undefined);
        }

        refreshCardsPanel() {
            // Clear cards panel
            this.cardsPanel.innerHTML = '';
            this.cardsPanel.classList.remove('chronological');

            // Repopulate with new display mode
            if (this.showChronological) {
                this.populateChronologicalCards(this.cardsPanel);
            } else {
                this.populateAlphabeticalCards(this.cardsPanel);
            }

            // Maintain selected card
            if (this.selectedCard) {
                this.selectCard(this.selectedCard);
            }
        }

        close() {
            if (this.modal) {
                this.modal.remove();
                this.modal = null;
            }
        }
    }

    if (window.location.href.includes("webteases/") && !window.location.href.includes("showtease")) {
        new DisplayData().display()

        const observer = new MutationObserver(() => new DisplayData().display());
        observer.observe(document.querySelector("#tease_list"), { childList: true, subtree: false });
    }

    function addTeaseDataSection(cached_data) {
        const section = window.sidebar.addSection("tease_data", "Tease Data");

        const dataDisplay = window.sidebar.addText("Click on Summary to display tease data", section, ["width-100"])

        function _displayData(data) {
            const text = displayJsonData(data);
            dataDisplay.innerHTML = text.split(", ").join("<br>");
        }

        if (cached_data) {
            _displayData(cached_data)
        }

        const showButton = window.sidebar.addButton(cached_data ? "Refresh Summary" : "Summary", async () => {
            const new_data = await scraper.getTeaseSummary(window.pageData.id);
            _displayData(new_data);

            showButton.disabled = true;
        }, section)
        window.sidebar.addButton("Download Json", () => {
            scraper.downloadJson(window.pageData.id, window.pageData.title);
        }, section)
        window.sidebar.addButton("Download Simplified", () => {
            scraper.downloadSimplifiedJson(window.pageData.id, window.pageData.title);
        }, section)
        window.sidebar.addButton("Viewer", () => {
            scraper.getSimplifiedJson(window.pageData.id, new ConnectionMapper().showSimplifiedTease);
        }, section)
    }

    function addNavigationSection(cached_data) {
        const section = window.sidebar.addSection("eos_navigation", "Navigation (EOS)", [], 1);
        if (!cached_data || !cached_data.page_names) {
            const showButton = window.sidebar.addButton("Load Data", async () => {
                const new_data = await scraper.getTeaseSummary(window.pageData.id);
                showButton.remove();
                _addNavigationSection(new_data, section);
            }, section)
        } else {
            _addNavigationSection(cached_data, section);
        }

        function _addNavigationSection(cached_data, section) {
            const options = cached_data.page_names.sort();
            window.sidebar.addFilterableDropdown(options, (selectedValue) => {
                if (!selectedValue) return;
                const url = `https://milovana.com/webteases/showtease.php?id=${window.pageData.id}&preview=1&page=${encodeURIComponent(selectedValue)}`
                if (window.location.href.includes('showtease.php') && !window.location.href.includes('preview')) {
                    if (confirm('Do you want to reload the tease in preview mode? All progress will be lost.')) {
                        window.location.href = url;
                    }
                } else {
                    window.location.href = url;
                }
            }, section, [], "Select Page");
        }
    }

    function sidebar_integration() {
        if (window.pageData.type !== window.TEASE_TYPES.eos) return;


        const cached_data = scraper.get_data(window.pageData.id);
        addTeaseDataSection(cached_data);
        addNavigationSection(cached_data);
    }

    // Listen for sidebar ready event instead of using setTimeout
    window.addEventListener('milovana-sidebar-ready', sidebar_integration);

    // Fallback: if sidebar is already loaded (in case event fires before listener attaches)
    if (window.sidebar && window.location.href.includes("showtease")) {
        sidebar_integration();
    }
})();
