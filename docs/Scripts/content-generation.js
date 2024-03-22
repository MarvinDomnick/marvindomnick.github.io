//Import Octokit - API for Github
import { Octokit, App } from "https://esm.sh/octokit";

const repoPath = 'docs/Media'

let sourceFolder;
let imgReferences = [];
let imgDirectory = [];
let titleDirectory = [];
let contentSources = [];

getRepoData()

//Generates content of page
async function getRepoData(){
    const contentSelector = document.getElementById('contentSelector');

    //Determine page's folder
    {
        if(window.location.pathname === "/university-projects.html"){
            sourceFolder = "UniversityProjects";
        }
        else{
            sourceFolder = "PersonalProjects"
        }
    }

    //Initialize Octokit
    // Octokit.js
    // https://github.com/octokit/core.js#readme
    const octokit = new Octokit({ })

    //Fetch content from Page's folder
    const repo = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: 'MarvinDomnick',
        repo: 'marvindomnick.github.io',
        path: `${repoPath}/${sourceFolder}`,
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
    });

    //Go through all found folders and form contentOptions in html
    {
        let subjectFolder = 0;
        for(subjectFolder; subjectFolder<repo.data.length; subjectFolder++){

            //Fetch contents of subject project folder from Github
            const project = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}/{project}', {
                owner: 'MarvinDomnick',
                repo: 'marvindomnick.github.io',
                path: `${repoPath}/${sourceFolder}`,
                project: `${repo.data[subjectFolder].name}`,
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            });

            //Form content reference and add to list for future use
            const contentSource = `/Media/${sourceFolder}/${repo.data[subjectFolder].name}`;
            contentSources.push(contentSource);

            //Get data from folder's JSON file and then process data
            {
                await fetch(`${contentSource}/content.json`)
                    .then(response => response.json())
                    .then(data => {
                        //Use data to update data lists
                        {

                            imgReferences.push([])
                            imgDirectory.push(0)
                            titleDirectory.push(data.descriptions)

                            //Add image references to imgReferences list
                            let iteration = 0;
                            project.data.forEach(function (){
                                if(iteration < project.data.length-1){
                                    imgReferences[subjectFolder].push(project.data[iteration].name);
                                    iteration++;
                                }
                            })
                        }

                        //Use data to add html elements
                        {
                            let html = '\n' +
                                '           <div id="contentOptionContainer'+subjectFolder+'" class="contentOptionContainer" href="UniversityProjects.html">\n' +
                                '                <a class="contentOptionLink" href="university-projects.html"></a>\n' +
                                '                <button id="contentOptionImgSwapLeft'+subjectFolder+'" class="contentOptionImgSwapLeft"><</button>\n' +
                                '                <button id="contentOptionImgSwapRight'+subjectFolder+'" class="contentOptionImgSwapRight">></button>\n' +
                                '                <p class="contentOptionTitle">' + data.title + '</p>\n' +
                                '                <img id="contentOptionImg'+subjectFolder+'" class="contentOptionImg" src="' + contentSource + '/' + imgReferences[subjectFolder][imgDirectory[subjectFolder]] + '"></img>\n' +
                                '                <p id="contentOptionImgTitle'+subjectFolder+'" class="contentOptionImgTitle">' + data.descriptions[0] + '</p>\n' +
                                '                <div id="contentOptionImgCounter' + subjectFolder + '" class="contentOptionImgCounter"></div>' +
                                '           </div>';

                            contentSelector.innerHTML += html;

                            const counter = document.getElementById("contentOptionImgCounter" + subjectFolder)

                            let x = 0;
                            for (x; x<project.data.length-1; x++){
                                counter.innerHTML += '                  <div id="contentOptionImgCount_'+subjectFolder+'_'+x+'" class="contentOptionImgCount"></div>\n'
                            }

                            const currentImgCount = document.getElementById("contentOptionImgCount_"+subjectFolder+'_'+0);
                            currentImgCount.classList.add("contentOptionImgCountCurrent");
                        }

                    })
            }

        }
    }

    //Add eventListeners to swapping buttons to switch between images manually
    {
        let iteration = 0;
        let swapLefts = document.querySelectorAll('.contentOptionImgSwapLeft');
        swapLefts.forEach(function (swapLeft){
            let subjectFolder = iteration;
            iteration++;

            swapLeft.addEventListener('click', function() {
                swapImage("l", subjectFolder);
            })
        })

        iteration = 0;
        let swapRights = document.querySelectorAll('.contentOptionImgSwapRight');
        swapRights.forEach(function (swapRight){
            let subjectFolder = iteration;
            iteration++;

            swapRight.addEventListener('click', function() {
                swapImage("r", subjectFolder);
            })
        })
    }
}

function swapImage(direction, subjectFolder) {
    const imgElement = document.getElementById("contentOptionImg"+subjectFolder);
    const imgTitleElement = document.getElementById("contentOptionImgTitle"+subjectFolder);
    const imgCounterElementOld = document.getElementById("contentOptionImgCount_"+subjectFolder+"_"+imgDirectory[subjectFolder])

    if(direction === "r"){
        imgDirectory[subjectFolder]++;
        if (imgDirectory[subjectFolder] > imgReferences[subjectFolder].length-1){
            imgDirectory[subjectFolder] = 0;
        }
    }
    else {
        imgDirectory[subjectFolder]--;
        if (imgDirectory[subjectFolder] < 0){
            imgDirectory[subjectFolder] = imgReferences[subjectFolder].length-1;
        }
    }
    const imgCounterElementNew = document.getElementById("contentOptionImgCount_"+subjectFolder+"_"+imgDirectory[subjectFolder])

    imgCounterElementOld.classList.remove("contentOptionImgCountCurrent");
    imgCounterElementNew.classList.add("contentOptionImgCountCurrent");
    imgElement.setAttribute('src', contentSources[subjectFolder] + '/' + imgReferences[subjectFolder][imgDirectory[subjectFolder]]);
    imgTitleElement.innerHTML = titleDirectory[subjectFolder][imgDirectory[subjectFolder]];
}