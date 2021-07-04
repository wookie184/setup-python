import * as core from '@actions/core';
import * as finder from './find-python';
import * as finderPyPy from './find-pypy';
import * as path from 'path';
import * as os from 'os';

function isPyPyVersion(versionSpec: string) {
  return versionSpec.startsWith('pypy-');
}

async function run() {
  try {
    let versions: string[] = core
      .getInput('python-version')
      .split(' ')
      .filter(x => x !== '');
    let archs: string[] = core
      .getInput('architecture')
      .split(' ')
      .filter(x => x !== '') || [os.arch()];
    for (var arch of archs) {
      for (var version of versions) {
        if (isPyPyVersion(version)) {
          const installed = await finderPyPy.findPyPyVersion(version, arch);
          core.info(
            `Successfully setup PyPy ${installed.resolvedPyPyVersion} with Python (${installed.resolvedPythonVersion})`
          );
        } else {
          const installed = await finder.findPythonVersion(version, arch);
          core.info(
            `Successfully setup ${installed.impl} (${installed.version})`
          );
        }
        const matchersPath = path.join(__dirname, '..', '.github');
        core.info(`##[add-matcher]${path.join(matchersPath, 'python.json')}`);
      }
    }
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();