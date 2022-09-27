import {
  Tree,
  formatFiles,
  updateJson,
  ProjectConfiguration,
  getProjects,
} from '@nrwl/devkit';
import { hostname } from 'os';

function getScopes(projectMap: Map<string, ProjectConfiguration>) {
  const projects: any[] = Array.from(projectMap.values());
  const allScopes: string[] = projects
    .map((project) =>
      project.tags
        // take only those that point to scope
        .filter((tag: string) => tag.startsWith('scope:'))
    )
    // flatten the array
    .reduce((acc, tags) => [...acc, ...tags], [])
    // remove prefix `scope:`
    .map((scope: string) => scope.slice(6));
  // remove duplicates
  return Array.from(new Set(allScopes));
}

function replaceScopes(content: string, scopes: string[]): string {
  const joinScopes = scopes.map((s) => `'${s}'`).join(' | ');
  const PATTERN = /interface UtilGeneratorSchema \{\n.*\n.*\n\}/gm;
  return content.replace(
    PATTERN,
    `interface UtilGeneratorSchema {
      name: string;
      directory: ${joinScopes};
    }`
  );
}

export default async function (tree: Tree) {
  const projectMap = getProjects(tree);
  const scopes = getScopes(projectMap);
  const libPath = 'tools/generators/util-lib/';
  await updateJson(tree, libPath + 'schema.json', (jsonContent) => {
    jsonContent.properties.directory['x-prompt'].items = scopes.map(
      (scope) => ({
        value: scope,
        label: scope.toUpperCase(),
      })
    );
    return jsonContent;
  });
  const schemaInterface = 'tools/generators/interfaces/generator-interface.ts';
  const content = tree.read(schemaInterface, 'utf-8') as string;
  console.log(content);
  console.log(scopes);
  const updatedContent = replaceScopes(content, scopes);
  console.log(updatedContent);
  tree.write(schemaInterface, updatedContent);
  await formatFiles(tree);
}
