#### Oppgavedefinisjon
Vi tok utgangspunkt i en oppgavedefinisjon som

### Metode *(750)*

#### Arbeidsfordeling
Vår gruppe hadde ulik arbeidsfordeling i de ulike fasene. Felles for de var en slags overordnet struktur: organisatorisk - visuelt - teknisk.
*italic*
**bold**

#### Fremdriftsplan og faser i prosjektet
Prosjektet begynte med en omfattende planleggingsfase
- scope
- brief
- SWOT
- Prosjektplan

Dette resulterte i en fremdriftsplan som kartla de ulike fasene i prosjektet, milepæler, tidsfrister, samt andre hendelser som hadde potensiale til å påvirke prosjektarbeidet (andre eksamener, helligdager, etc.).

##### Prosjektplanlegging
##### Idémyldring
##### Prototyping og testing
##### Bygging


### Resultater

#### Fase 1
#### Fase 2
#### Fase 3 - Prototyping og testing

##### Prototype
Den største forskjellen mellom vårt produkt og andre magasin-lignende visninger av saker var navigasjonen. Derfor var dette det viktigste aspektet vi ønsket å teste. Likevel er dette en så grunnleggende egenskap av produktet at vi bygget hele saken for å teste flyten i navigasjonen.

Vi brukte teksten journaliststudentene ga oss, men vi manglet både bilder og video. Ettersom teksten var tung å lese uten noen bilder, valgte vi å sette inn illustrasjonsbilder der det var passende. Dette var mer i tråd med hvordan vi så for oss det endelige produktet skulle se ut, se det ga oss også en mer virkelighetsnær prototype.

Arbeidet i denne fasen var hovedsaklig todelt: Overordnet art direction, og de konkrete designløsningene på hver side. Vi brukte Adobe Illustrator for design av hver side, Adobe Photoshop for bildemanipulering (rastergrafikk, fargetoner), og Adobe Experience Design (XD) for å sette det hele sammen. XD hadde to begrensninger gjorde realistisk testing utfordrende: Mangel på støtte for animasjon, og fingerbevegelser. En sentral del av navigasjonen var at hver side skulle kunne dras vekk med en fingerbevegelse, og hint for tilgjengelige navigasjonsmuligheter skulle kunne skjules ved at hintene gradvis forsvant etterhvert som leseren ble kjent med navigasjonsmåten.


##### Testing
Når prototypen nærmet seg ferdig begynte vi prosessen å kalle inn testpersoner til prosjektet.

*... administrative ting ...*



*... Ting vi fant i testingen ...*


Vi fant også at vår antakelse om at produktet var lett å gå seg vill i ikke stemte.


#### Fase 4 - Bygging
Den siste fasen i prosjektet var den faktiske byggingen av produktet. Som med de tidligere fasene hadde vi noen konseptuelle roller *[ARBEIDSFORDELING HER]*. Min oppgave i prosjektet var å utvikle den tekniske løsningen som drev navigasjonen.

##### Utforsking
Vårt arbeid i denne fasen begynte med å utforske hvilke løsninger som kunne være mest hensiktsmessig. Finnes det teknologier, rammeverk, eller systemer som lar oss oppnå denne typen for navigasjon på en enkel måte? Vi fant at det eksisterte flere rammeverk som var bygget for å ha en modul på siden som kunne swipes horisontalt. Flere av disse var likevel hovedsaklig bygget med slideshows i tankene, og støttet derfor ikke flerdimensjonal navigasjon. De var heller ikke spesielt godt egnet som den primære formen for navigasjon på grunn av begrensninger i rammeverket (som f.eks å ikke støtte html). Vi bestemte oss derfor for å bygge navigasjonen fra grunn av.

Rammeverk bygget for å gjøre utvikling av "single-page applications" ble vurdert (som `Vue.js`, `AngularJS`, og `React`). Vi konkluderte derimot at det ville ta for lang tid å lære disse rammeverkene til at gevinsten ville være verdt det. Ideelt skulle likevel vårt navigasjonsprosjekt vært laget som en modul i f.eks. AngularJS slik at den kunne enklere tilpasses andre artikkelserier, skaleres opp, og plugges inn i eksisterende sider. Kompabilitet og skalerbarhet var likevel aspekter som havnet utenfor vårt scope, så vi valgte å se bort i fra denne problemstillingen.

Siden utgangspunktet var å bygge systemet selv, og siden jeg hadde rollen som utvikler begynte jeg å lete etter mindre utvidelsespakker som kunne gjøre prosessen enklere. Jeg oppdaget [utvidelsesbiblioteket anime.js](http://animejs.com/). Dette lille *(14.4kB)* biblioteket kunne håndtere det meste av animasjon for oss. Dette veldig greit da anime.js kunne ta seg av nettleserkompbabilitet mens jeg brukte tid på problemer spesifikt for vårt prosjekt.

[Google developers hadde også noen veiledende tips](https://developers.google.com/web/fundamentals/design-and-ux/input/touch/) når det kom til nøyaktig hvordan det å trykke og dra burde håndteres. Det introduserte likevel et lag med kompleksitet da de anbefalte å implementere to løsninger: en for nettlesere som støttet `window.PointerEvent`, og en for de som ikke gjorde det. De anbefalte også å bruke `requestAnimationFrame()` for å tvinge nettlesere til å kjøre HTML-paints oftere slik at siden responderte raskere.

##### Utvikling
Min rolle var å bygge selve navigasjonssystemet, de andre i gruppen tok seg av å bygge .html-sider og .css-stilark. Jeg delte opp arbeidet i mindre delmål:

 1. Elementer som kan dras
 2. Navigasjon mellom tittelsidene
 3. Navigasjon til artikkelen
 4. Automatisk visning av piler
 5. Trykkbare piler
 6. Tidslinje

De tre første punktene bød på de største utfordingene, bruken av `setPointerCapture` og `document.onmousedown` gjorde at nettleserenes innebygde scroll-håndtering ble overstyrt. Dette gjorde at jeg måtte implementere egen scroll-håndtering som i tur hadde konsekvenser jeg vil komme tilbake til i diskusjonsdelen av denne rapporten.

#### asdf
Etter prototype- og testfasen hadde vi en god oversikt over hvilke utfordringer vi burde ha spesielt fokus på.

### Diskusjon

#### Prosjekt og prosjektplanlegging
Prosjektet ble gjennomført omtrent som planlagt og som forventet. Vi tok utgangspunkt i fagets fremgang

#### Om tilgjengelighet og universell utforming
Vårt navigasjonssystem er markant annerledes enn vanlige nettsider. Dette gjør at tilgjengelighet for skjermlesere er en utfordring fordi nettlesere vet nødvendigvis ikke hvordan de skal lese siden. Spesielt tre faktorer spiller inn på dette: Asynkron nedlasting og de ulike navigasjonsmulighetene gjør at kronologien i markupen ikke nødvendigvis stemmer med strukturen på teksten. For det andre er navigasjonen avhengig av visuelle hint. For det tredje kreves fingerbevegelse i riktig retning for å navigere artikkelen.

Disse utfordringene er mulig å løse, men ville etter det jeg erfarer krevd en betydelig utviklingsperiode. Derfor har vi valgt å prioritere  den grunnleggende funksjonaliteten i denne omgang.


####
