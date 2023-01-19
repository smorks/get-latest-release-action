import * as core from '@actions/core'
import {Octokit} from '@octokit/rest'

async function run(): Promise<void> {
  try {
    const repository = core.getInput('repository')
    const token = core.getInput('token').trim()
    let owner = core.getInput('owner')
    let repo = core.getInput('repo')
    const ref = core.getInput('ref')
    const excludes = core.getInput('excludes').trim().split(',')

    if (repository) {
      ;[owner, repo] = repository.split('/')
    }

    const octokit = new Octokit({auth: token})

    let releases = (await octokit.repos.listReleases({owner, repo, ref})).data

    if (excludes.includes('prerelease')) {
      releases = releases.filter(x => !x.prerelease)
    }

    if (excludes.includes('draft')) {
      releases = releases.filter(x => !x.draft)
    }

    if (releases.length > 0) {
      core.setOutput('release', releases[0].tag_name)
      core.setOutput('id', releases[0].id.toString())
    } else {
      core.setFailed('No valid releases')
    }

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
