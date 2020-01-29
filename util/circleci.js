const { comment, padding, multilineComment } = require('./configGen.js');
const { handleComments } = require('./unsupported.js');

// TODO: How to handle agents? I would recommend creating a wizard like experience to create executors which can then be assigned

// Is config in strings really the best way to do this? I investigated yaml libraries, but didn't see anything I fell in love with.
const executors = () => `
version: 2.1

# You can replace your executor in any job with an executor defined here. A good start would be replacing the image in your Docker executor with one of our convience images.
# The Docker executor meets the needs of over 80% of our users.
# https://circleci.com/docs/2.0/executor-types
executors:
  default:
    docker:
  # List of convenience images: https://circleci.com/docs/2.0/circleci-images/#latest-image-tags-by-language
      - image: circleci/python:3.6
    working_directory: ~/proj
  macos:
    macos:
      xcode: "10.1.0"
    working_directory: ~/proj
    shell: /bin/bash --login
  windows:
    machine:
      resource_class: windows.medium
      image: "windows-server-2019:201908-06"
      shell: bash
  `;

const workflowsPreamble = () =>`
workflows:
  version: 2
  build-test-deploy:
    jobs:
`

const jobsPreamble = () => `
jobs:
`

const writeJobToWorkflow = (job) => {
  // only run steps for the most naive implementation
  return padding(6) + '- ' + job.name;
}

const writeRequires = (job) => {
  return `:
          requires:
              - ` + job.name;
}

const writeWithPadding = (str, spaces) => {
  return padding(spaces) + str;
}

const writeJobSteps = (job) => {
  let output = ''
  for (let i = 0; i < job.steps.length; i++) {
    if (!job.steps[i].supported) {
      // TODO: Write out as comment
    } else {
      output += writeWithPadding('- run: ' + job.steps[i].cmd, 6) + '\n';
    }
  }
  return output
}

const writeWorkflows = (workflow) => {
  let output = workflowsPreamble();
  let firstLine = true;
  for (let i = 0; i < workflow.jobs.length; i++) {
    output += writeJobToWorkflow(workflow.jobs[i]);
    if (firstLine) {
      firstLine = !firstLine
      output += '\n'
    } else {
      output += writeRequires(workflow.jobs[i-1]) + '\n';
    } 
  }
  return output;
}

const writeJobs = (workflow) => {
  let output = jobsPreamble();
  for (let i = 0; i < workflow.jobs.length; i++) {
    output += writeWithPadding(workflow.jobs[i].name + ':\n', 2);
    // TODO: Non-static executor entries
    output += writeWithPadding('executor: default\n', 4);
    output += writeWithPadding('steps:\n', 4);
    output += writeJobSteps(workflow.jobs[i]);
  }
  return output;
}

const writeComments = (workflow) => {
  return handleComments(workflow.comments);
}

const createConfig = (workflow) => {
  let config = ''
  config += executors();
  config += writeWorkflows(workflow);
  config += writeJobs(workflow);
  config += writeComments(workflow);
  return config;
}

module.exports = { executors, createConfig };



















