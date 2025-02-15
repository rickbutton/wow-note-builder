import type { Component } from "solid-js";
import { createSignal, For, getOwner, onMount, runWithOwner } from "solid-js";
import { makePersisted } from "@solid-primitives/storage";

function trimNote(value: string) {
  const v = value.replaceAll('"', "").trim();
  return v;
}

function AppBody() {
  const [assigns, setAssigns] = makePersisted(createSignal(""), { name: "lhs" });
  const [healer, setHealer] = makePersisted(createSignal(""), { name: "rhs" });
  const [errors, setErrors] = createSignal<string[]>([]);
  const [showCopied, setShowCopied] = createSignal(false);
  const owner = getOwner();

  function validate() {
    const healerLines = healer().split("\n");

    const names = new Set<string>();
    for (const line of healerLines) {
      const matches = line.matchAll(/([^\s]+) {spell/g);
      for (const match of matches) {
        names.add(match[1]);
      }
    }

    const errors = [];
    for (const name of names) {
      if (!assigns().includes(name)) {
        errors.push(`${name} is in the healer note but not the assignment note!`);
      }
    }
    setErrors(errors);
  }
  function updateAssigns(value: string) {
    setAssigns(trimNote(value));
    setShowCopied(false);
    validate();
  }
  function updateHealer(value: string) {
    setHealer(trimNote(value));
    setShowCopied(false);
    validate();
  }
  function result() {
    return healer() + "\n\n" + assigns();
  }

  function copyNote() {
    navigator.clipboard.writeText(result());
    setShowCopied(true);

    setTimeout(() => {
      runWithOwner(owner, () => setShowCopied(false));
    }, 5000);
  }

  onMount(() => validate());

  return (
    <section class="min-h-screen flex flex-col pl-16 pr-16">
      <div class="flex justify-center space-x-8 pt-4">
        <div class="flex flex-col w-1/2 h-64">
          <div>
            <span class="text-lg font-bold">Assignment Note</span>
          </div>
          <textarea class="flex-grow" value={assigns()} oninput={(e) => updateAssigns(e.currentTarget.value)}></textarea>
        </div>
        <div class="flex flex-col w-1/2 h-64">
          <div>
            <span class="text-lg font-bold">Healer Note</span>
          </div>
          <textarea class="flex-grow" value={healer()} oninput={(e) => updateHealer(e.currentTarget.value)}></textarea>
        </div>
      </div>
      <div class="flex flex-col pt-8 h-64">
          <div class="text-lg font-bold">Result</div>
          <textarea class="flex-grow" readonly={true} value={result()}></textarea>
      </div>
      <div class="pt-8">
        <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => copyNote()}>Copy to Clipboard</button>
        {showCopied() ? <div class="text-lg font-bold text-green-500">Copied!</div> : null}
      </div>
      <div class="pt-8">
        {errors().length > 0 ? <div class="text-lg font-bold text-red-500">{errors().length} Errors</div> : null}
        <For each={errors()}>{(error) => <div class="text-red-500">{error}</div>}</For>
      </div>
    </section>
  );
}



const App: Component = () => {
  return (
    <>
      <nav class="bg-gray-200 text-gray-900 justify-center items-center flex pt-6 pb-6">
        <div class="text-3xl font-bold">WoW Note Builder</div>
      </nav>
      <main class="bg-gray-100 text-gray-700 text-center min-h-screen pt-8">
        <AppBody />
      </main>
    </>
  );


};

export default App;
