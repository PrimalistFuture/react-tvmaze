import axios from "axios";
import * as $ from "jquery";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const BASE_URL = "https://api.tvmaze.com/";
const ALT_IMG =
  "https://store-images.s-microsoft.com/image/apps.65316.13510798887490672.6e1ebb25-96c8-4504-b714-1f7cbca3c5ad.f9514a23-1eb8-4916-a18e-99b1a9817d15?mode=scale&q=90&h=300&w=300";


interface ShowFromAPIInterface {
  show: {
  id: number;
  name: string;
  summary: string;
  image: {medium: string};
  }
}
interface ShowInterface {
  id: number;
  name: string;
  summary: string;
  image: string;
}
interface EpisodeInterface {
  id: number;
  name: string;
  season: string;
  number: string;
}
/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term: string): Promise<ShowInterface[]> {
  const response = await axios.get(`${BASE_URL}search/shows?q=${term}`);
  const showsFromAPI: ShowFromAPIInterface[] = response.data;
  const shows = showsFromAPI.map((s) => ({
    id: s.show.id,
    name: s.show.name,
    summary: s.show.summary,
    image: s.show.image.medium,
  }));

  return shows;
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: ShowInterface[]): void {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              onerror="this.src = ${ALT_IMG}"
              class="w-25 me-3"
              >
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `
    );
    $showsList.append($show);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay(): Promise<void> {
  const term = $("#searchForm-term").val() as string;
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id: number): Promise<EpisodeInterface[]> {
  const response = await axios.get(`${BASE_URL}shows/${id}/episodes`);
  console.log(response.data);
  const episodes = response.data.map((e: EpisodeInterface) => ({
    id: e.id,
    name: e.name,
    season: e.season,
    number: e.number,
  }));
  console.log(episodes);
  return episodes;
}

/** toggles and empties episodes, appends episodes on DOM */

function populateEpisodes(episodes: EpisodeInterface[]) {
  const episodesList = $("#episodesList");
  $("#episodesList").empty();
  $("#episodesArea").toggle();
  for (let e of episodes) {
    const $e = $(
      `<li id="${e.id}">${e.name} (season: ${e.season}, episode: ${e.number})</li>`
    );
    episodesList.append($e);
  }
}

/** Targets nearest show to event, calls api with showId, calls populateEpisodes */

async function getEpisodesAndDisplay(evt: JQuery.ClickEvent) {
  const showId = $(evt.target).closest(".Show").data("show-id");
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
}

$showsList.on("click", ".Show-getEpisodes", getEpisodesAndDisplay);
