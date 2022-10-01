<script lang="ts">
import { game, games } from 'chess-fetcher'

const defaultUsername = 'Fins'
const defaultFirstGameLink = 'https://lichess.org/r6LZ0lc0'

type Chapter = {
  timestamp: string
  title: string
}

export default {
  data() {
    return {
      username: defaultUsername,
      firstGameLink: defaultFirstGameLink,

      games: [],

      timestampOfFirstGame: 30,
      options: {
        showOpeningName: true,
        showOpponentName: true,
        showOpponentRating: true,
      },
    }
  },

  computed: {
    isUsingDefault(): boolean {
      return this.username === defaultUsername && this.firstGameLink === defaultFirstGameLink
    },
    firstGameTimestamp(): number {
      return this.games[0].timestamp
    },
    hasChapters(): boolean {
      return this.games.length > 0
    },
    chapters(): Chapter[] {
      if (!this.hasChapters) {
        return []
      }

      return [
        this.timestampOfFirstGame >= 10
          ? {
              timestamp: '0:00',
              title: 'Introduction',
            }
          : {},
        ...this.games.map((game): Chapter => {
          let title: string[] = []

          if (this.options.showOpeningName) {
            title.push(game.opening.name)
          }

          let opponentName: string
          let opponentRating: number
          if (this.username.toLowerCase() === game.players.white.username.toLowerCase()) {
            opponentName = (game.players.black.title || '') + ' ' + game.players.black.username
            opponentRating = game.players.black.rating
          } else {
            opponentName = (game.players.white.title || '') + ' ' + game.players.white.username
            opponentRating = game.players.white.rating
          }

          if (this.options.showOpponentName) {
            title.push('- vs ' + opponentName)
          }

          if (this.options.showOpponentRating) {
            title.push('(' + opponentRating + ')')
          }

          return {
            timestamp: this.convertSecondsToHhMmSs(this.timestampOfFirstGame + (game.timestamp - this.firstGameTimestamp) / 1000),
            title: title.join(' '),
          }
        }),
      ]
    },
  },

  methods: {
    convertSecondsToHhMmSs(seconds) {
      // YouTube chapters have to be at least 10 seconds long
      // so if the 1st game starts within the first 10 seconds of the video, just use "0:00"
      if (seconds < 10) {
        seconds = 0
      }
      let date = new Date('2000-01-01T00:00:00Z')
      date.setSeconds(seconds)
      let timestamp = date.toISOString().substring(11, 19)

      return timestamp.replace(/^0+:?0?/, '')
    },
    onSubmit() {
      this.games = []
      game(this.firstGameLink).then((game) => {
        let timestampForFirstGame = game.timestamp
        games(
          `https://lichess.org/@/${this.username}`,
          (game) => {
            this.games.push(game)
          },
          {
            since: timestampForFirstGame,
            until: timestampForFirstGame + 60 * 60 * 10 * 1000, // get 10 hours worth of games
            sort: 'dateAsc',
            opening: true,
          }
        )
      })
    },
  },
}
</script>

<template>
  <div class="w-full lg:w-2/3 mx-auto">
    <div class="bg-slate-100 p-4">
      <form @submit.prevent="onSubmit" class="w-3/4 mx-auto">
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Lichess username</span>
            <input type="text" class="input input-bordered input-accent w-full max-w-xs" spellcheck="false" v-model="username" />
          </label>
        </div>
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Link to the first game</span>
            <input type="text" class="input input-bordered input-accent w-full max-w-xs" spellcheck="false" v-model="firstGameLink" />
          </label>
        </div>
        <div class="text-center my-4">
          <button type="submit" class="btn btn-wide btn-accent">Generate Chapters</button>
        </div>
      </form>
      <div class="bg-slate-300 m-4 p-4 text-center" v-if="isUsingDefault">
        <p class="mb-2">Use the prefilled examples above to see what the output would look like for this "Lichess Plays" video:</p>
        <iframe class="rounded-xl w-full aspect-video" src="https://www.youtube.com/embed/Aw3zcG_efuI" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
    </div>
    <div class="bg-slate-200 p-4 my-2" v-if="hasChapters">
      <h3 class="font-semibold">Options</h3>
      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text">Include the opening name</span>
          <input type="checkbox" class="toggle toggle-accent" v-model="options.showOpeningName" />
        </label>
      </div>
      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text">Include the opponent's username</span>
          <input type="checkbox" class="toggle toggle-accent" v-model="options.showOpponentName" />
        </label>
      </div>
      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text">Include the opponent's rating</span>
          <input type="checkbox" class="toggle toggle-accent" v-model="options.showOpponentRating" />
        </label>
      </div>
      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text">First game starts at (seconds into video)</span>
          <input type="number" class="input input-bordered input-accent w-24" v-model.number="timestampOfFirstGame" min="0" />
        </label>
      </div>
    </div>
    <div class="bg-yellow-100 p-4" v-if="hasChapters">
      <h3 class="font-semibold">Copy &amp; paste this to the video description</h3>
      <p>YouTube will automatically add chapter markers and link the timestamps once this content is in the description</p>
      <div class="p-4 whitespace-nowrap overflow-x-auto">
        <template v-for="chapter in chapters">
          {{ chapter.timestamp }} {{ chapter.title }}
          <br />
        </template>
      </div>
    </div>
  </div>
</template>
