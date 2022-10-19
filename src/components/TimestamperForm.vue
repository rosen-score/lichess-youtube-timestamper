<script lang="ts">
import { game, games } from 'chess-fetcher'
import { Game } from 'chess-fetcher/dist/types'
import { defineComponent } from 'vue'

const defaultUsername = 'Fins'
const defaultFirstGameLink = 'https://lichess.org/r6LZ0lc0'

type Chapter = {
  timestamp: string
  title: string
}

export default defineComponent({
  data() {
    return {
      usernameInput: defaultUsername,
      firstGameLink: defaultFirstGameLink,

      games: [] as Game[],

      gamesStartAt: 30, // seconds into YouTube video when the first game starts
      options: {
        showOpeningName: true,
        showOpponentName: true,
        showOpponentRating: true,
      },
    }
  },

  computed: {
    username(): string {
      return this.usernameInput.toLowerCase().trim()
    },
    isUsingDefault(): boolean {
      return this.username === defaultUsername.toLowerCase() && this.firstGameLink === defaultFirstGameLink
    },
    hasGames(): boolean {
      return this.games.length > 0
    },
    firstGameTimestamp(): number {
      return this.hasGames ? this.games[0].timestamp : 0
    },
    chapters(): Chapter[] {
      if (!this.hasGames) {
        return []
      }

      let chapters = this.games.map((game): Chapter => {
        let title: string[] = []

        if (this.options.showOpeningName) {
          title.push(game.opening.name)
        }

        let opponentName: string
        let opponentRating: number | undefined
        if (this.username === game.players.white.username.toLowerCase()) {
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
          timestamp: this.convertSecondsToHhMmSs(this.gamesStartAt + (game.timestamp - this.firstGameTimestamp) / 1000),
          title: title.join(' '),
        }
      })

      if (this.gamesStartAt >= 10) {
        chapters.unshift({
          timestamp: '0:00',
          title: 'Introduction',
        })
      }

      return chapters
    },
  },

  methods: {
    convertSecondsToHhMmSs(seconds: number): string {
      // YouTube chapters have to be at least 10 seconds long
      // so if the 1st game starts within the first 10 seconds of the video, just use "0:00"
      if (seconds < 10) {
        seconds = 0
      }
      let date = new Date('2000-01-01T00:00:00Z')
      date.setSeconds(seconds)
      return date.toISOString().substring(11, 19).replace(/^0+:?0?/, '')
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
            until: timestampForFirstGame + 10 * 60 * 60 * 1000, // get 10 hours worth of games
            sort: 'dateAsc',
            opening: true,
          }
        )
      })
    },
  },
})
</script>

<template>
  <div class="lg:flex lg:flex-row">
    <div class="lg:basis-5/12 flex-none bg-slate-100 p-4" :class="{ 'mx-auto lg:basis-2/3': !hasGames }">
      <form @submit.prevent="onSubmit">
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Lichess username</span>
            <input type="text" class="input input-bordered input-accent w-full max-w-xs" spellcheck="false" v-model="usernameInput" />
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
      <div class="bg-slate-300 m-4 p-4 text-center rounded-lg" v-if="isUsingDefault">
        <p class="mb-2">Use the prefilled examples above to see what the output would look like for this "Lichess Plays" video:</p>
        <iframe class="rounded-xl w-full aspect-video" src="https://www.youtube.com/embed/Aw3zcG_efuI" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
    </div>
    <div class="lg:basis-7/12 flex-none" v-if="hasGames">
      <div class="bg-slate-200 p-4">
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
            <input type="number" class="input input-bordered input-accent w-24" v-model.number="gamesStartAt" min="0" />
          </label>
        </div>
      </div>
      <div class="bg-yellow-100 p-4">
        <h3 class="font-semibold">Copy &amp; paste this to the video description</h3>
        <p>YouTube will automatically add chapter markers and link the timestamps once this content is in the description</p>
        <div class="py-4 px-2 text-sm">
          <div v-for="chapter in chapters">
            {{ (chapter as Chapter).timestamp }} {{ (chapter as Chapter).title }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
