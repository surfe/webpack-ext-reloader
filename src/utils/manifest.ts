import { readFileSync } from "fs";
import { flatMapDeep } from "lodash";
import { Compiler, Entry } from "webpack";
import { bgScriptEntryErrorMsg, bgScriptManifestRequiredMsg } from "../messages/errors";

export function extractEntries(
  webpackEntry: Entry,
  manifestPath: string,
  webpackOutput: Compiler["options"]["output"] = {},
): IEntriesOption {
  const manifestJson = JSON.parse(readFileSync(manifestPath).toString()) as IExtensionManifest;
  const { background, content_scripts } = manifestJson;
  const { filename } = webpackOutput;

  if (!filename) {
    throw new Error("Please specify the `output.filename` in your webpack config.");
  }

  if (!background?.service_worker) {
    throw new TypeError(bgScriptManifestRequiredMsg.get());
  }

  const bgScriptFileName = background.service_worker;
  const toRemove = (filename as string).replace("[name]", "");

  if (!bgScriptFileName) {
    throw new TypeError(bgScriptEntryErrorMsg.get());
  }

  const contentEntries: unknown = content_scripts
    ? flatMapDeep(Object.keys(webpackEntry), (entryName) =>
        content_scripts.map(({ js }) =>
          js.map((contentItem) => contentItem.replace(toRemove, "")).filter((contentItem) => contentItem === entryName),
        ),
      )
    : null;
  return {
    background: bgScriptFileName,
    contentScript: contentEntries as string[],
    extensionPage: null,
  };
}
