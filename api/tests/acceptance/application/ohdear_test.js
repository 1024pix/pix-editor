import { describe, expect, it } from 'vitest';
import _ from 'lodash';
import { Buffer } from 'node:buffer';
import { createServer } from '../../../server';
import * as config from '../../../lib/config.js';
import { knex } from '../../test-helper.js';

describe('Acceptance | Controller | ohdear-controller', () => {
  describe('POST /ohdear/webhook', () => {
    describe('when OhDear-Signature header is missing', () => {
      it('returns a 401 status code', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/ohdear/webhook',
        });

        // then
        expect(response.statusCode).toBe(401);
      });
    });

    describe('when OhDear-Signature does not match payload', () => {
      it('returns a 401 status code', async () => {
        // given
        const payload = { type: 'brokenLinksFoundNotification' };
        const serializedPayload = JSON.stringify(payload);
        const wrongSignature = Buffer.from('wrong signature').toString('base64');

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/ohdear/webhook',
          payload: serializedPayload,
          headers: { 'OhDear-Signature': wrongSignature },
        });

        // then
        expect(response.statusCode).toBe(401);
      });
    });

    describe('when event is brokenLinksFoundNotification', () => {
      it('returns a 200 status code', async () => {
        // given
        const payload = {
          run: {
            id: 68967972282, check: {
              id: 1212361, type: 'broken_links', enabled: true, monitor: {
                id: 99173, url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', tags: [], label: '06 - Moulinette Url', notes: null, checks: [
                  { id: 1212358, type: 'uptime', enabled: false, created_at: '2026-07-30T13:09:52.000000Z', monitor_id: 99173, parameters: null, updated_at: '2026-07-30T13:18:06.000000Z', order_column: 0, latest_run_id: 67702257028, latest_run_result: 'failed', latest_run_ended_at: '2026-07-30T13:17:36.000000Z', latest_completed_run_id: 67702257028, latest_completed_run_result: 'failed', latest_completed_run_summary: 'Site down', latest_completed_run_ended_at: '2026-07-30T13:17:36.000000Z' },
                  { id: 1212359, type: 'performance', enabled: true, created_at: '2026-07-30T13:09:52.000000Z', monitor_id: 99173, parameters: null, updated_at: '2026-07-30T13:09:52.000000Z', order_column: 1, latest_run_id: null, latest_run_result: 'succeeded', latest_run_ended_at: null, latest_completed_run_id: null, latest_completed_run_result: null, latest_completed_run_summary: null, latest_completed_run_ended_at: null },
                  { id: 1212360, type: 'certificate_health', enabled: false, created_at: '2026-07-30T13:09:52.000000Z', monitor_id: 99173, parameters: null, updated_at: '2026-07-30T13:18:06.000000Z', order_column: 2, latest_run_id: 67702189406, latest_run_result: 'succeeded', latest_run_ended_at: '2026-07-30T13:15:39.000000Z', latest_completed_run_id: 67702189406, latest_completed_run_result: 'succeeded', latest_completed_run_summary: null, latest_completed_run_ended_at: '2026-07-30T13:15:39.000000Z' },
                  { id: 1212361, type: 'broken_links', enabled: true, created_at: '2026-07-30T13:09:52.000000Z', monitor_id: 99173, parameters: null, updated_at: '2026-08-25T14:17:53.000000Z', order_column: 3, latest_run_id: 68967972282, latest_run_result: 'failed', latest_run_ended_at: '2026-08-25T14:17:53.000000Z', latest_completed_run_id: 68967972282, latest_completed_run_result: 'failed', latest_completed_run_summary: '10 broken links', latest_completed_run_ended_at: '2026-08-25T14:17:53.000000Z' },
                  { id: 1212362, type: 'mixed_content', enabled: false, created_at: '2026-07-30T13:09:52.000000Z', monitor_id: 99173, parameters: null, updated_at: '2026-07-30T13:18:06.000000Z', order_column: 4, latest_run_id: 67701984834, latest_run_result: 'succeeded', latest_run_ended_at: '2026-07-30T13:09:54.000000Z', latest_completed_run_id: 67701984834, latest_completed_run_result: 'succeeded', latest_completed_run_summary: null, latest_completed_run_ended_at: '2026-07-30T13:09:54.000000Z' },
                  { id: 1212363, type: 'lighthouse', enabled: false, created_at: '2026-07-30T13:09:52.000000Z', monitor_id: 99173, parameters: null, updated_at: '2026-07-30T13:18:06.000000Z', order_column: 5, latest_run_id: 67701994945, latest_run_result: 'errored-or-timed-out', latest_run_ended_at: '2026-07-30T13:10:11.000000Z', latest_completed_run_id: null, latest_completed_run_result: null, latest_completed_run_summary: null, latest_completed_run_ended_at: null },
                  { id: 1212364, type: 'cron', enabled: false, created_at: '2026-07-30T13:09:52.000000Z', monitor_id: 99173, parameters: null, updated_at: '2026-07-30T13:09:52.000000Z', order_column: 6, latest_run_id: null, latest_run_result: 'pending', latest_run_ended_at: null, latest_completed_run_id: null, latest_completed_run_result: null, latest_completed_run_summary: null, latest_completed_run_ended_at: null },
                  { id: 1212365, type: 'application_health', enabled: false, created_at: '2026-07-30T13:09:52.000000Z', monitor_id: 99173, parameters: null, updated_at: '2026-07-30T13:09:52.000000Z', order_column: 7, latest_run_id: null, latest_run_result: 'pending', latest_run_ended_at: null, latest_completed_run_id: null, latest_completed_run_result: null, latest_completed_run_summary: null, latest_completed_run_ended_at: null },
                  { id: 1212366, type: 'sitemap', enabled: false, created_at: '2026-07-30T13:09:52.000000Z', monitor_id: 99173, parameters: null, updated_at: '2026-07-30T13:09:52.000000Z', order_column: 8, latest_run_id: null, latest_run_result: 'pending', latest_run_ended_at: null, latest_completed_run_id: null, latest_completed_run_result: null, latest_completed_run_summary: null, latest_completed_run_ended_at: null },
                  { id: 1212367, type: 'dns', enabled: false, created_at: '2026-07-30T13:09:52.000000Z', monitor_id: 99173, parameters: null, updated_at: '2026-07-30T13:18:06.000000Z', order_column: 9, latest_run_id: 67702189552, latest_run_result: 'succeeded', latest_run_ended_at: '2026-07-30T13:15:41.000000Z', latest_completed_run_id: 67702189552, latest_completed_run_result: 'succeeded', latest_completed_run_summary: null, latest_completed_run_ended_at: '2026-07-30T13:15:41.000000Z' },
                  { id: 1212368, type: 'domain', enabled: false, created_at: '2026-07-30T13:09:52.000000Z', monitor_id: 99173, parameters: null, updated_at: '2026-07-30T13:18:06.000000Z', order_column: 10, latest_run_id: 67701984737, latest_run_result: 'succeeded', latest_run_ended_at: '2026-07-30T13:09:53.000000Z', latest_completed_run_id: 67701984737, latest_completed_run_result: 'succeeded', latest_completed_run_summary: null, latest_completed_run_ended_at: '2026-07-30T13:09:53.000000Z' },
                  { id: 1212369, type: 'dns_blocklist', enabled: false, created_at: '2026-07-30T13:09:52.000000Z', monitor_id: 99173, parameters: null, updated_at: '2026-07-30T13:18:06.000000Z', order_column: 12, latest_run_id: 67701984784, latest_run_result: 'succeeded', latest_run_ended_at: '2026-07-30T13:09:54.000000Z', latest_completed_run_id: 67701984784, latest_completed_run_result: 'succeeded', latest_completed_run_summary: null, latest_completed_run_ended_at: '2026-07-30T13:09:54.000000Z' },
                ], team_id: 22909, sort_url: 'editor.pix.fr\/api\/external-urls?page=6', created_at: '2026-07-30 13:09:52', group_name: '', updated_at: '2026-07-30 13:23:34', uses_https: true, description: null, crawler_speed: 'fastest', friendly_name: '06 - Moulinette Url', respect_robots: false, latest_run_date: '2026-08-25 14:17:53', crawler_settings: { speed: 'fastest', headers: [{ name: 'x-api-key', value: 'f9fe6ff8-5096-446f-aea1-a8420ab6e2db' }], respect_robots: false }, dns_check_settings: { extra_cnames: [], frequency_unit: 'hour', frequency_value: 2, monitor_main_domain: false, ignored_record_types: ['SOA'], check_nameservers_in_sync: true }, ports_check_settings: { continent: 'europe', frequency_unit: 'day', frequency_value: 1, behind_cloudflare: false, baseline_confirmed: false, expected_open_ports: [80, 443], failed_notification_threshold: 1 }, domain_check_settings: { frequency_unit: 'hour', frequency_value: 4, not_supported_reason: null, expires_soon_threshold_in_days: 30 }, uptime_check_settings: { payload: [], timeout: 5, location: 'paris', http_verb: 'get', raw_payload: null, absent_string: null, frequency_unit: 'minute', frequency_value: 1, look_for_string: '', max_redirect_count: 5, valid_status_codes: ['2*'], http_client_headers: [], response_body_assertions: null, expected_response_headers: [], expected_final_redirect_url: null, failed_notification_threshold: 2 }, sitemap_check_settings: { path: 'sitemap.xml', speed: 'default', frequency_unit: 'day', frequency_value: 1 }, summarized_check_result: 'failed', lighthouse_check_settings: { continent: 'europe', frequency_unit: 'day', frequency_value: 1, device_emulation: 'desktop', http_client_headers: [], notification_settings: null }, performance_check_settings: { threshold_in_ms: 3500, change_percentage: 50, failed_notification_threshold: 0 }, broken_links_check_settings: { types: ['link'], frequency_unit: 'day', new_links_only: false, frequency_value: 1, force_crawl_urls: [''], whitelisted_urls: [''], do_not_crawl_urls: [''], check_include_external_links: true }, dns_blocklist_check_settings: { frequency_unit: 'day', frequency_value: 1, enabled_blocklists: [], use_all_blocklists: true }, application_health_check_settings: { secret: 'JzRzVUKFP3qaksF0', headers: [], result_url: null, failed_notification_threshold: 0 }, certificate_health_check_settings: { frequency_unit: 'minute', frequency_value: 30, expires_soon_threshold_in_days: null },
              }, created_at: '2026-07-30T13:09:52.000000Z', monitor_id: 99173, parameters: null, updated_at: '2026-08-25T14:17:53.000000Z', order_column: 3, latest_run_id: 68967972282, latest_run_result: 'failed', latest_run_ended_at: '2026-08-25T14:17:53.000000Z', latest_completed_run_id: 68967972282, latest_completed_run_result: 'failed', latest_completed_run_summary: '10 broken links', latest_completed_run_ended_at: '2026-08-25T14:17:53.000000Z',
            }, result: 'failed', check_id: 1212361, ended_at: '2026-08-25T14:17:53.000000Z', created_at: '2026-08-25T14:17:53.000000Z', started_at: '2026-08-25T13:54:26.000000Z', updated_at: '2026-08-25T14:17:53.000000Z', result_payload: {
              whitelist: [
                'https:\/\/linkedin.com\/*',
                'https:\/\/*.linkedin.com\/*',
                'http:\/\/linkedin.com\/*',
                'http:\/\/*.linkedin.com\/*',
                'https:\/\/news.ycombinator.com\/*',
                'https:\/\/www.facebook.com\/sharer\/sharer.php*',
                'http:\/\/www.reddit.com\/submit?*',
                'https:\/\/github.com\/issues?*',
                'https:\/\/github.com\/pulls?*',
                'https:\/\/itunes.apple.com*',
                'https:\/\/docs.spatie.be\/join*',
                'https:\/\/www.tumblr.com*',
                'https:\/\/tumblr.com*',
                'http:\/\/www.tumblr.com*',
                'http:\/\/tumblr.com*',
                'https:\/\/twitter.com*',
                'https:\/\/www.twitter.com*',
                'http:\/\/twitter.com*',
                'http:\/\/www.twitter.com*',
                'https:\/\/t.co*',
                'https:\/\/x.com*',
                '*\/cdn-cgi\/l\/email-protection*',
                '\/cdn-cgi\/l\/email-protection*',
                'https:\/\/instagram.com\/*',
                'https:\/\/*.instagram.com\/*',
                'http:\/\/instagram.com\/*',
                'http:\/\/*.instagram.com\/*',
              ], broken_links: [
                { type: 'link', link_text: 'c challenge1xubXNLAMpKANy', crawled_url: 'https:\/\/cafdoc.sharepoint.com\/sites\/BF-P-PilotagechantiersPIX\/_layouts\/15\/guestaccess.aspx?guestaccesstoken=eKnAMmQfam%2BDle0H7VpFssz0Ddc01hxNO03wAVqJNx4%3D&docid=2_0058ea59b5ab34b359fa85d7c2b155d98&rev=1&e=2XS1sT', status_code: 403, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: 'Client error: `GET https:\/\/cafdoc.sharepoint.com\/sites\/BF-P-PilotagechantiersPIX\/_layouts\/15\/guestaccess.aspx?guestaccesstoken=eKnAMmQfam%2BDle0H7VpFssz0Ddc01hxNO03wAVqJNx4%3D&docid=2_0058ea59b5ab34b359fa85d7c2b155d98&rev=1&e=2XS1sT` resulted in a `403 Forbidden` response' },
                { type: 'link', link_text: 'c challenge1z8jPLAIt1ZZAP', crawled_url: 'https:\/\/doi.org\/10.1073\/pnas.1519735112', status_code: 403, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: 'Client error: `GET https:\/\/doi.org\/10.1073\/pnas.1519735112` resulted in a `403 Forbidden` response' },
                { type: 'link', link_text: 'c challenge1XIZrJA4w1tQal', crawled_url: 'https:\/\/hitechglitz.com\/france\/cette-video-de-survol-de-mercure-montre-la-planete-avec-des-details-incroyables\/', status_code: 404, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: 'Client error: `GET https:\/\/hitechglitz.com\/france\/cette-video-de-survol-de-mercure-montre-la-planete-avec-des-details-incroyables\/` resulted in a `404 Not Found` response' },
                { type: 'link', link_text: 'c challenge1wnPLD0L6ZI6g6', crawled_url: 'https:\/\/openverse.org\/fr\/image\/df5e18ed-f936-4e46-93ba-dcc4ef0d7000', status_code: 403, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: 'Client error: `GET https:\/\/openverse.org\/fr\/image\/df5e18ed-f936-4e46-93ba-dcc4ef0d7000` resulted in a `403 Forbidden` response' },
                { type: 'link', link_text: 'c challenge1VbBtVanak336l', crawled_url: 'https:\/\/pixedu.moodlecloud.com\/course\/view.php?id=11&lang=fr', status_code: 403, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: 'Client error: `GET https:\/\/pixedu.moodlecloud.com\/course\/view.php?id=11&lang=fr` resulted in a `403 Forbidden` response' },
                { type: 'link', link_text: 'c challenge1yT0M489lXGoJq', crawled_url: 'https:\/\/qruiz.net\/Q\/?TQrayg', status_code: 503, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: 'Server error: `GET https:\/\/qruiz.net\/Q\/?TQrayg` resulted in a `503 Service Temporarily Unavailable` response' },
                { type: 'link', link_text: 'c challenge1uxjgiBFiI5J1C', crawled_url: 'https:\/\/shs.cairn.info\/?lang=en', status_code: 403, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: 'Client error: `GET https:\/\/shs.cairn.info\/?lang=en` resulted in a `403 Forbidden` response' },
                { type: 'link', link_text: 'c challenge1w8uG6tPpyLfOF', crawled_url: 'https:\/\/www.bemyeyes.com\/fr\/', status_code: 404, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: 'Client error: `GET https:\/\/www.bemyeyes.com\/fr\/` resulted in a `404 Not Found` response' },
                { type: 'link', link_text: 'c challenge1uL367MMCzAzHN', crawled_url: 'https:\/\/www.herault-data.fr\/explore\/dataset\/indice-de-la-qualite-de-lair-herault\/table\/', status_code: 404, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: 'Client error: `GET https:\/\/www.herault-data.fr\/explore\/dataset\/indice-de-la-qualite-de-lair-herault\/table\/` resulted in a `404 Not Found` response' },
                { type: 'link', link_text: 'c challenge1xsrCLrNqmfe6Y', crawled_url: 'https:\/\/www.medias24.com\/', status_code: 403, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: 'Client error: `GET https:\/\/www.medias24.com\/` resulted in a `403 Forbidden` response' },
              ], crawled_urls: [
                { type: 'link', link_text: '', crawled_url: 'https:\/\/aidantsconnect.beta.gouv.fr\/', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/ameliconnect.ameli.fr\/oauth2\/authorize?scope=openid+ameliconnect&response_type=code&nonce=1d5d47efa0923&redirect_uri=https%3A%2F%2Fassure.ameli.fr%3A443%2FPortailAS%2Fappmanager%2FPortailAS%2Fassure%3F_nfpb%3Dtrue%26_pageLabel%3Das_login_page%26cb%3Dtrue&state=3d0e4164be669&client_id=compte_AS', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/api.socrative.com\/rc\/DTjWRQ', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/app.pix.fr\/youtube-video.html?v=6QN_I41oaXQ', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: 'c challenge1xubXNLAMpKANy', crawled_url: 'https:\/\/cafdoc.sharepoint.com\/sites\/BF-P-PilotagechantiersPIX\/_layouts\/15\/guestaccess.aspx?guestaccesstoken=eKnAMmQfam%2BDle0H7VpFssz0Ddc01hxNO03wAVqJNx4%3D&docid=2_0058ea59b5ab34b359fa85d7c2b155d98&rev=1&e=2XS1sT', status_code: 403, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: 'Client error: `GET https:\/\/cafdoc.sharepoint.com\/sites\/BF-P-PilotagechantiersPIX\/_layouts\/15\/guestaccess.aspx?guestaccesstoken=eKnAMmQfam%2BDle0H7VpFssz0Ddc01hxNO03wAVqJNx4%3D&docid=2_0058ea59b5ab34b359fa85d7c2b155d98&rev=1&e=2XS1sT` resulted in a `403 Forbidden` response' },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/calculateur-bourses.education.gouv.fr\/cabs\/api\/v1\/lycee\/simulateur.html', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/chatgpt.com\/en-EN\/overview?openaicom_referred=true', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/chatgpt.com\/fr-FR\/overview?openaicom_referred=true', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/creativecommons.org\/licenses\/by\/2.0\/?ref=openverse', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/data.paysdelaloire.fr', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/data.paysdelaloire.fr\/pages\/home\/', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: 'c challenge1z8jPLAIt1ZZAP', crawled_url: 'https:\/\/doi.org\/10.1073\/pnas.1519735112', status_code: 403, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: 'Client error: `GET https:\/\/doi.org\/10.1073\/pnas.1519735112` resulted in a `403 Forbidden` response' },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', status_code: 200, found_on_url: '', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/fondationfolon.be\/nl\/', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/form-eu.123formbuilder.com\/65671\/inscription-a-la-cantine-3-pour-une-epreuve', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/fr.123rf.com\/images-libres-de-droits\/plan%C3%A8te_terre.html', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/fr.vikidia.org\/wiki\/Simone_Veil', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/fr.wikimini.org\/wiki\/Intelligence_artificielle', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/gradesofgreen.org\/\/', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: 'c challenge1XIZrJA4w1tQal', crawled_url: 'https:\/\/hitechglitz.com\/france\/cette-video-de-survol-de-mercure-montre-la-planete-avec-des-details-incroyables\/', status_code: 404, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: 'Client error: `GET https:\/\/hitechglitz.com\/france\/cette-video-de-survol-de-mercure-montre-la-planete-avec-des-details-incroyables\/` resulted in a `404 Not Found` response' },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/laclassedemallory.files.wordpress.com\/2019\/08\/mouvement-de-pop-et-naissa-france-1.pdf', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/laclassedemallory.net\/2017\/03\/08\/un-an-de-calcul-mental\/', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/lannuaire.service-public.fr\/pays-de-la-loire\/sarthe\/aec26af9-beb7-439b-870a-6d1aa8a89bf0', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/learningapps.org\/watch?v=pth9ee1pc22', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: 'c challenge1wm17fRviMldn3', crawled_url: 'https:\/\/lesfondamentaux.reseau-canope.fr\/video\/musique\/musique-creation-et-droit-dauteur\/musique-creation-et-droit-dauteur\/la-creation-et-le-droit-moral', status_code: 303, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: 'Will not follow more than 5 redirects' },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/nl.wikipedia.org\/wiki\/Suriname', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/opendata.hauts-de-seine.fr\/explore\/dataset\/logements-etudiants-finances\/table\/?disjunctive.commune&sort=code_insee', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/openheritage.eu\/', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: 'c challenge1wnPLD0L6ZI6g6', crawled_url: 'https:\/\/openverse.org\/fr\/image\/df5e18ed-f936-4e46-93ba-dcc4ef0d7000', status_code: 403, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: 'Client error: `GET https:\/\/openverse.org\/fr\/image\/df5e18ed-f936-4e46-93ba-dcc4ef0d7000` resulted in a `403 Forbidden` response' },
                { type: 'link', link_text: 'c challenge1VbBtVanak336l', crawled_url: 'https:\/\/pixedu.moodlecloud.com\/course\/view.php?id=11&lang=fr', status_code: 403, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: 'Client error: `GET https:\/\/pixedu.moodlecloud.com\/course\/view.php?id=11&lang=fr` resulted in a `403 Forbidden` response' },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/placedesarts.com', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/presse.inserm.fr\/une-nouvelle-strategie-de-therapie-genique-contre-la-drepanocytose-et-la-beta-thalassemie\/46042\/', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/pxhere.com\/fr\/photos?q=images+de+la+terre&search=&NSFW=off', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: 'c challenge1yT0M489lXGoJq', crawled_url: 'https:\/\/qruiz.net\/Q\/?TQrayg', status_code: 503, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: 'Server error: `GET https:\/\/qruiz.net\/Q\/?TQrayg` resulted in a `503 Service Temporarily Unavailable` response' },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/school.moodledemo.net\/course\/view.php?id=59&lang=fr', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/school.moodledemo.net\/my\/courses.php?lang=fr', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: 'c challenge1uxjgiBFiI5J1C', crawled_url: 'https:\/\/shs.cairn.info\/?lang=en', status_code: 403, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: 'Client error: `GET https:\/\/shs.cairn.info\/?lang=en` resulted in a `403 Forbidden` response' },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/trajectoire.sante-ra.fr\/Trajectoire\/', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/tube-arts-lettres-sciences-humaines.apps.education.fr\/w\/13cd797e-e4de-46b4-aa06-52908eb07434', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/view.genial.ly\/5e862e5d88cf590db32a811f', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/whc.unesco.org\/en\/interactive-map\/', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/wiki.openfoodfacts.org\/Documentation', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/wiki.openfoodfacts.org\/Projects_homepage', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/wikikids.nl\/', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.ameli.fr\/sage-femme\/exercice-liberal\/telesante\/la-teleexpertise', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.assainissement.developpement-durable.gouv.fr\/pages\/data\/carteIntSteu.php', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.badmintoneurope.com', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.bemyeyes.com\/', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: 'c challenge1w8uG6tPpyLfOF', crawled_url: 'https:\/\/www.bemyeyes.com\/fr\/', status_code: 404, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: 'Client error: `GET https:\/\/www.bemyeyes.com\/fr\/` resulted in a `404 Not Found` response' },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.bing.com\/images\/search?q=image+terre&qft=+filterui:license-L1&form=IRFLTR&first=1&tsc=ImageBasicHover', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.cada.fr\/connaitre-la-loi-cada', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.clean4green.org\/', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.cnil.fr\/sites\/cnil\/files\/atoms\/files\/referentiel_-_traitements_dans_le_domaine_de_la_sante_hors_recherches.pdf', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.digitaltrends.com\/space\/mercury-flyby-video-shows-planet-amazing-detail\/', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.europeana.eu\/en\/item\/9200119\/3D6F941CA24C18AA1544F78DCEE86A0CCE16BDAA', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.europeana.eu\/fr\/item\/376\/photography_ProvidedCHO_Royal_Institute_for_Cultural_Heritage__KIK_IRPA___Brussels__Belgium__KIK_IRPA_n__11039445', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.europeana.eu\/nl\/item\/376\/photography_ProvidedCHO_Royal_Institute_for_Cultural_Heritage__KIK_IRPA___Brussels__Belgium__KIK_IRPA_n__11039445', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.facebook.com\/?lang=en', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.facebook.com\/privacy\/policy\/?locale=fr_FR', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: 'c challenge1uIYLcXldy9xzZ', crawled_url: 'http:\/\/www.faqs.org\/faqs\/', status_code: 429, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: 'Client error: `GET http:\/\/www.faqs.org\/faqs\/` resulted in a `429 Too Many Requests` response' },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.flickr.com\/photos\/21644167@N04', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.flickr.com\/photos\/21644167@N04\/8711378816', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.franceculture.fr\/emissions\/eureka\/eureka-emission-du-mercredi-18-aout-2021', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.google.com\/?hl=nl', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.guggenheim.org\/', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.hcsp.fr\/explore.cgi\/avisrapportsdomaine?clefr=759', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: 'c challenge1uL367MMCzAzHN', crawled_url: 'https:\/\/www.herault-data.fr\/explore\/dataset\/indice-de-la-qualite-de-lair-herault\/table\/', status_code: 404, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: 'Client error: `GET https:\/\/www.herault-data.fr\/explore\/dataset\/indice-de-la-qualite-de-lair-herault\/table\/` resulted in a `404 Not Found` response' },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.ina.fr\/ina-eclaire-actu\/l-echarpe-tricolore-des-maires-un-embleme-bien-francais', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.inserm.fr\/actualite\/pourquoi-faut-il-alimenter-jour-si-on-dort-nuit\/', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.inserm.fr\/dossier\/migraine\/', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.interieur.gouv.fr\/', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.kartable.fr\/ressources\/mathematiques\/cours\/la-proportionnalite-6\/40630\/', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.labiologie.net\/index.php?page=11', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.larousse.fr\/encyclopedie\/personnage\/Ren%C3%A9_Magritte\/131106', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.logicieleducatif.fr\/francais\/homonymes\/dictees-en-ligne.php', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.lumni.fr\/jeu\/les-regions-de-france', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.mailo.com\/mailo\/auth\/index.php?page=presentation&language=nl', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.maxicours.com\/se\/cours\/evolution-des-solutions-techniques-appliquees-a-la-communication\/', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: 'c challenge1xsrCLrNqmfe6Y', crawled_url: 'https:\/\/www.medias24.com\/', status_code: 403, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: 'Client error: `GET https:\/\/www.medias24.com\/` resulted in a `403 Forbidden` response' },
                { type: 'link', link_text: '', crawled_url: 'http:\/\/www.moray.gov.uk\/', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.nature.com\/articles\/s41598-021-03109-x', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.nytimes.com\/', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.openseamap.org\/index.php?id=61&L=1', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.ox.ac.uk\/', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.pourquoidocteur.fr\/Articles\/Question-d-actu\/38322-Pour-perdre-poids-suffirait-de-macher', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.quebec.ca\/', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.quiziniere.com\/diffusions\/E7XAJQ', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.qwant.com\/?l=fr&t=images&q=terre', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.shazam.com\/', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.shazam.com\/fr-fr', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.viatrajectoire.fr', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.wto.org\/\/french\/thewto_f\/minist_f\/mc10_f\/participant_guide_f.pdf', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'http:\/\/www.wto.org\/\/french\/thewto_f\/minist_f\/mc10_f\/participant_guide_f.pdf', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.wto.org\/french\/thewto_f\/minist_f\/mc10_f\/participant_guide_f.pdf', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'http:\/\/www.wto.org\/french\/thewto_f\/minist_f\/mc10_f\/participant_guide_f.pdf', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.wto.org\/\u2026}', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
                { type: 'link', link_text: '', crawled_url: 'https:\/\/www.x.com\/', status_code: 200, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', error_message: null },
              ],
            },
          }, site: {
            id: 99173, url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', tags: [], label: '06 - Moulinette Url', notes: null, checks: [
              { id: 1212358, type: 'uptime', enabled: false, created_at: '2026-07-30T13:09:52.000000Z', monitor_id: 99173, parameters: null, updated_at: '2026-07-30T13:18:06.000000Z', order_column: 0, latest_run_id: 67702257028, latest_run_result: 'failed', latest_run_ended_at: '2026-07-30T13:17:36.000000Z', latest_completed_run_id: 67702257028, latest_completed_run_result: 'failed', latest_completed_run_summary: 'Site down', latest_completed_run_ended_at: '2026-07-30T13:17:36.000000Z' },
              { id: 1212359, type: 'performance', enabled: true, created_at: '2026-07-30T13:09:52.000000Z', monitor_id: 99173, parameters: null, updated_at: '2026-07-30T13:09:52.000000Z', order_column: 1, latest_run_id: null, latest_run_result: 'succeeded', latest_run_ended_at: null, latest_completed_run_id: null, latest_completed_run_result: null, latest_completed_run_summary: null, latest_completed_run_ended_at: null },
              { id: 1212360, type: 'certificate_health', enabled: false, created_at: '2026-07-30T13:09:52.000000Z', monitor_id: 99173, parameters: null, updated_at: '2026-07-30T13:18:06.000000Z', order_column: 2, latest_run_id: 67702189406, latest_run_result: 'succeeded', latest_run_ended_at: '2026-07-30T13:15:39.000000Z', latest_completed_run_id: 67702189406, latest_completed_run_result: 'succeeded', latest_completed_run_summary: null, latest_completed_run_ended_at: '2026-07-30T13:15:39.000000Z' },
              { id: 1212361, type: 'broken_links', enabled: true, created_at: '2026-07-30T13:09:52.000000Z', monitor_id: 99173, parameters: null, updated_at: '2026-08-25T14:17:53.000000Z', order_column: 3, latest_run_id: 68967972282, latest_run_result: 'failed', latest_run_ended_at: '2026-08-25T14:17:53.000000Z', latest_completed_run_id: 68967972282, latest_completed_run_result: 'failed', latest_completed_run_summary: '10 broken links', latest_completed_run_ended_at: '2026-08-25T14:17:53.000000Z' },
              { id: 1212362, type: 'mixed_content', enabled: false, created_at: '2026-07-30T13:09:52.000000Z', monitor_id: 99173, parameters: null, updated_at: '2026-07-30T13:18:06.000000Z', order_column: 4, latest_run_id: 67701984834, latest_run_result: 'succeeded', latest_run_ended_at: '2026-07-30T13:09:54.000000Z', latest_completed_run_id: 67701984834, latest_completed_run_result: 'succeeded', latest_completed_run_summary: null, latest_completed_run_ended_at: '2026-07-30T13:09:54.000000Z' },
              { id: 1212363, type: 'lighthouse', enabled: false, created_at: '2026-07-30T13:09:52.000000Z', monitor_id: 99173, parameters: null, updated_at: '2026-07-30T13:18:06.000000Z', order_column: 5, latest_run_id: 67701994945, latest_run_result: 'errored-or-timed-out', latest_run_ended_at: '2026-07-30T13:10:11.000000Z', latest_completed_run_id: null, latest_completed_run_result: null, latest_completed_run_summary: null, latest_completed_run_ended_at: null },
              { id: 1212364, type: 'cron', enabled: false, created_at: '2026-07-30T13:09:52.000000Z', monitor_id: 99173, parameters: null, updated_at: '2026-07-30T13:09:52.000000Z', order_column: 6, latest_run_id: null, latest_run_result: 'pending', latest_run_ended_at: null, latest_completed_run_id: null, latest_completed_run_result: null, latest_completed_run_summary: null, latest_completed_run_ended_at: null },
              { id: 1212365, type: 'application_health', enabled: false, created_at: '2026-07-30T13:09:52.000000Z', monitor_id: 99173, parameters: null, updated_at: '2026-07-30T13:09:52.000000Z', order_column: 7, latest_run_id: null, latest_run_result: 'pending', latest_run_ended_at: null, latest_completed_run_id: null, latest_completed_run_result: null, latest_completed_run_summary: null, latest_completed_run_ended_at: null },
              { id: 1212366, type: 'sitemap', enabled: false, created_at: '2026-07-30T13:09:52.000000Z', monitor_id: 99173, parameters: null, updated_at: '2026-07-30T13:09:52.000000Z', order_column: 8, latest_run_id: null, latest_run_result: 'pending', latest_run_ended_at: null, latest_completed_run_id: null, latest_completed_run_result: null, latest_completed_run_summary: null, latest_completed_run_ended_at: null },
              { id: 1212367, type: 'dns', enabled: false, created_at: '2026-07-30T13:09:52.000000Z', monitor_id: 99173, parameters: null, updated_at: '2026-07-30T13:18:06.000000Z', order_column: 9, latest_run_id: 67702189552, latest_run_result: 'succeeded', latest_run_ended_at: '2026-07-30T13:15:41.000000Z', latest_completed_run_id: 67702189552, latest_completed_run_result: 'succeeded', latest_completed_run_summary: null, latest_completed_run_ended_at: '2026-07-30T13:15:41.000000Z' },
              { id: 1212368, type: 'domain', enabled: false, created_at: '2026-07-30T13:09:52.000000Z', monitor_id: 99173, parameters: null, updated_at: '2026-07-30T13:18:06.000000Z', order_column: 10, latest_run_id: 67701984737, latest_run_result: 'succeeded', latest_run_ended_at: '2026-07-30T13:09:53.000000Z', latest_completed_run_id: 67701984737, latest_completed_run_result: 'succeeded', latest_completed_run_summary: null, latest_completed_run_ended_at: '2026-07-30T13:09:53.000000Z' },
              { id: 1212369, type: 'dns_blocklist', enabled: false, created_at: '2026-07-30T13:09:52.000000Z', monitor_id: 99173, parameters: null, updated_at: '2026-07-30T13:18:06.000000Z', order_column: 12, latest_run_id: 67701984784, latest_run_result: 'succeeded', latest_run_ended_at: '2026-07-30T13:09:54.000000Z', latest_completed_run_id: 67701984784, latest_completed_run_result: 'succeeded', latest_completed_run_summary: null, latest_completed_run_ended_at: '2026-07-30T13:09:54.000000Z' },
            ], team_id: 22909, sort_url: 'editor.pix.fr\/api\/external-urls?page=6', created_at: '2026-07-30 13:09:52', group_name: '', updated_at: '2026-07-30 13:23:34', uses_https: true, description: null, crawler_speed: 'fastest', friendly_name: '06 - Moulinette Url', respect_robots: false, latest_run_date: '2026-08-25 14:17:53', crawler_settings: { speed: 'fastest', headers: [{ name: 'x-api-key', value: 'f9fe6ff8-5096-446f-aea1-a8420ab6e2db' }], respect_robots: false }, dns_check_settings: { extra_cnames: [], frequency_unit: 'hour', frequency_value: 2, monitor_main_domain: false, ignored_record_types: ['SOA'], check_nameservers_in_sync: true }, ports_check_settings: { continent: 'europe', frequency_unit: 'day', frequency_value: 1, behind_cloudflare: false, baseline_confirmed: false, expected_open_ports: [80, 443], failed_notification_threshold: 1 }, domain_check_settings: { frequency_unit: 'hour', frequency_value: 4, not_supported_reason: null, expires_soon_threshold_in_days: 30 }, uptime_check_settings: { payload: [], timeout: 5, location: 'paris', http_verb: 'get', raw_payload: null, absent_string: null, frequency_unit: 'minute', frequency_value: 1, look_for_string: '', max_redirect_count: 5, valid_status_codes: ['2*'], http_client_headers: [], response_body_assertions: null, expected_response_headers: [], expected_final_redirect_url: null, failed_notification_threshold: 2 }, sitemap_check_settings: { path: 'sitemap.xml', speed: 'default', frequency_unit: 'day', frequency_value: 1 }, summarized_check_result: 'failed', lighthouse_check_settings: { continent: 'europe', frequency_unit: 'day', frequency_value: 1, device_emulation: 'desktop', http_client_headers: [], notification_settings: null }, performance_check_settings: { threshold_in_ms: 3500, change_percentage: 50, failed_notification_threshold: 0 }, broken_links_check_settings: { types: ['link'], frequency_unit: 'day', new_links_only: false, frequency_value: 1, force_crawl_urls: [''], whitelisted_urls: [''], do_not_crawl_urls: [''], check_include_external_links: true }, dns_blocklist_check_settings: { frequency_unit: 'day', frequency_value: 1, enabled_blocklists: [], use_all_blocklists: true }, application_health_check_settings: { secret: 'JzRzVUKFP3qaksF0', headers: [], result_url: null, failed_notification_threshold: 0 }, certificate_health_check_settings: { frequency_unit: 'minute', frequency_value: 30, expires_soon_threshold_in_days: null },
          }, type: 'brokenLinksFoundNotification', uuid: '598fd6da-95e0-4111-96da-d730aad4d353', monitor: {
            id: 99173, url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', tags: [], label: '06 - Moulinette Url', notes: null, checks: [
              { id: 1212358, type: 'uptime', enabled: false, created_at: '2026-07-30T13:09:52.000000Z', monitor_id: 99173, parameters: null, updated_at: '2026-07-30T13:18:06.000000Z', order_column: 0, latest_run_id: 67702257028, latest_run_result: 'failed', latest_run_ended_at: '2026-07-30T13:17:36.000000Z', latest_completed_run_id: 67702257028, latest_completed_run_result: 'failed', latest_completed_run_summary: 'Site down', latest_completed_run_ended_at: '2026-07-30T13:17:36.000000Z' },
              { id: 1212359, type: 'performance', enabled: true, created_at: '2026-07-30T13:09:52.000000Z', monitor_id: 99173, parameters: null, updated_at: '2026-07-30T13:09:52.000000Z', order_column: 1, latest_run_id: null, latest_run_result: 'succeeded', latest_run_ended_at: null, latest_completed_run_id: null, latest_completed_run_result: null, latest_completed_run_summary: null, latest_completed_run_ended_at: null },
              { id: 1212360, type: 'certificate_health', enabled: false, created_at: '2026-07-30T13:09:52.000000Z', monitor_id: 99173, parameters: null, updated_at: '2026-07-30T13:18:06.000000Z', order_column: 2, latest_run_id: 67702189406, latest_run_result: 'succeeded', latest_run_ended_at: '2026-07-30T13:15:39.000000Z', latest_completed_run_id: 67702189406, latest_completed_run_result: 'succeeded', latest_completed_run_summary: null, latest_completed_run_ended_at: '2026-07-30T13:15:39.000000Z' },
              { id: 1212361, type: 'broken_links', enabled: true, created_at: '2026-07-30T13:09:52.000000Z', monitor_id: 99173, parameters: null, updated_at: '2026-08-25T14:17:53.000000Z', order_column: 3, latest_run_id: 68967972282, latest_run_result: 'failed', latest_run_ended_at: '2026-08-25T14:17:53.000000Z', latest_completed_run_id: 68967972282, latest_completed_run_result: 'failed', latest_completed_run_summary: '10 broken links', latest_completed_run_ended_at: '2026-08-25T14:17:53.000000Z' },
              { id: 1212362, type: 'mixed_content', enabled: false, created_at: '2026-07-30T13:09:52.000000Z', monitor_id: 99173, parameters: null, updated_at: '2026-07-30T13:18:06.000000Z', order_column: 4, latest_run_id: 67701984834, latest_run_result: 'succeeded', latest_run_ended_at: '2026-07-30T13:09:54.000000Z', latest_completed_run_id: 67701984834, latest_completed_run_result: 'succeeded', latest_completed_run_summary: null, latest_completed_run_ended_at: '2026-07-30T13:09:54.000000Z' },
              { id: 1212363, type: 'lighthouse', enabled: false, created_at: '2026-07-30T13:09:52.000000Z', monitor_id: 99173, parameters: null, updated_at: '2026-07-30T13:18:06.000000Z', order_column: 5, latest_run_id: 67701994945, latest_run_result: 'errored-or-timed-out', latest_run_ended_at: '2026-07-30T13:10:11.000000Z', latest_completed_run_id: null, latest_completed_run_result: null, latest_completed_run_summary: null, latest_completed_run_ended_at: null },
              { id: 1212364, type: 'cron', enabled: false, created_at: '2026-07-30T13:09:52.000000Z', monitor_id: 99173, parameters: null, updated_at: '2026-07-30T13:09:52.000000Z', order_column: 6, latest_run_id: null, latest_run_result: 'pending', latest_run_ended_at: null, latest_completed_run_id: null, latest_completed_run_result: null, latest_completed_run_summary: null, latest_completed_run_ended_at: null },
              { id: 1212365, type: 'application_health', enabled: false, created_at: '2026-07-30T13:09:52.000000Z', monitor_id: 99173, parameters: null, updated_at: '2026-07-30T13:09:52.000000Z', order_column: 7, latest_run_id: null, latest_run_result: 'pending', latest_run_ended_at: null, latest_completed_run_id: null, latest_completed_run_result: null, latest_completed_run_summary: null, latest_completed_run_ended_at: null },
              { id: 1212366, type: 'sitemap', enabled: false, created_at: '2026-07-30T13:09:52.000000Z', monitor_id: 99173, parameters: null, updated_at: '2026-07-30T13:09:52.000000Z', order_column: 8, latest_run_id: null, latest_run_result: 'pending', latest_run_ended_at: null, latest_completed_run_id: null, latest_completed_run_result: null, latest_completed_run_summary: null, latest_completed_run_ended_at: null },
              { id: 1212367, type: 'dns', enabled: false, created_at: '2026-07-30T13:09:52.000000Z', monitor_id: 99173, parameters: null, updated_at: '2026-07-30T13:18:06.000000Z', order_column: 9, latest_run_id: 67702189552, latest_run_result: 'succeeded', latest_run_ended_at: '2026-07-30T13:15:41.000000Z', latest_completed_run_id: 67702189552, latest_completed_run_result: 'succeeded', latest_completed_run_summary: null, latest_completed_run_ended_at: '2026-07-30T13:15:41.000000Z' },
              { id: 1212368, type: 'domain', enabled: false, created_at: '2026-07-30T13:09:52.000000Z', monitor_id: 99173, parameters: null, updated_at: '2026-07-30T13:18:06.000000Z', order_column: 10, latest_run_id: 67701984737, latest_run_result: 'succeeded', latest_run_ended_at: '2026-07-30T13:09:53.000000Z', latest_completed_run_id: 67701984737, latest_completed_run_result: 'succeeded', latest_completed_run_summary: null, latest_completed_run_ended_at: '2026-07-30T13:09:53.000000Z' },
              { id: 1212369, type: 'dns_blocklist', enabled: false, created_at: '2026-07-30T13:09:52.000000Z', monitor_id: 99173, parameters: null, updated_at: '2026-07-30T13:18:06.000000Z', order_column: 12, latest_run_id: 67701984784, latest_run_result: 'succeeded', latest_run_ended_at: '2026-07-30T13:09:54.000000Z', latest_completed_run_id: 67701984784, latest_completed_run_result: 'succeeded', latest_completed_run_summary: null, latest_completed_run_ended_at: '2026-07-30T13:09:54.000000Z' },
            ], team_id: 22909, sort_url: 'editor.pix.fr\/api\/external-urls?page=6', created_at: '2026-07-30 13:09:52', group_name: '', updated_at: '2026-07-30 13:23:34', uses_https: true, description: null, crawler_speed: 'fastest', friendly_name: '06 - Moulinette Url', respect_robots: false, latest_run_date: '2026-08-25 14:17:53', crawler_settings: { speed: 'fastest', headers: [{ name: 'x-api-key', value: 'f9fe6ff8-5096-446f-aea1-a8420ab6e2db' }], respect_robots: false }, dns_check_settings: { extra_cnames: [], frequency_unit: 'hour', frequency_value: 2, monitor_main_domain: false, ignored_record_types: ['SOA'], check_nameservers_in_sync: true }, ports_check_settings: { continent: 'europe', frequency_unit: 'day', frequency_value: 1, behind_cloudflare: false, baseline_confirmed: false, expected_open_ports: [80, 443], failed_notification_threshold: 1 }, domain_check_settings: { frequency_unit: 'hour', frequency_value: 4, not_supported_reason: null, expires_soon_threshold_in_days: 30 }, uptime_check_settings: { payload: [], timeout: 5, location: 'paris', http_verb: 'get', raw_payload: null, absent_string: null, frequency_unit: 'minute', frequency_value: 1, look_for_string: '', max_redirect_count: 5, valid_status_codes: ['2*'], http_client_headers: [], response_body_assertions: null, expected_response_headers: [], expected_final_redirect_url: null, failed_notification_threshold: 2 }, sitemap_check_settings: { path: 'sitemap.xml', speed: 'default', frequency_unit: 'day', frequency_value: 1 }, summarized_check_result: 'failed', lighthouse_check_settings: { continent: 'europe', frequency_unit: 'day', frequency_value: 1, device_emulation: 'desktop', http_client_headers: [], notification_settings: null }, performance_check_settings: { threshold_in_ms: 3500, change_percentage: 50, failed_notification_threshold: 0 }, broken_links_check_settings: { types: ['link'], frequency_unit: 'day', new_links_only: false, frequency_value: 1, force_crawl_urls: [''], whitelisted_urls: [''], do_not_crawl_urls: [''], check_include_external_links: true }, dns_blocklist_check_settings: { frequency_unit: 'day', frequency_value: 1, enabled_blocklists: [], use_all_blocklists: true }, application_health_check_settings: { secret: 'JzRzVUKFP3qaksF0', headers: [], result_url: null, failed_notification_threshold: 0 }, certificate_health_check_settings: { frequency_unit: 'minute', frequency_value: 30, expires_soon_threshold_in_days: null },
          }, date_time: '20260825041754', newBrokenLinks: [{ internal: false, link_text: 'c challenge1uL367MMCzAzHN', crawled_url: 'https:\/\/www.herault-data.fr\/explore\/dataset\/indice-de-la-qualite-de-lair-herault\/table\/', status_code: 404, found_on_url: 'https:\/\/editor.pix.fr\/api\/external-urls?page=6', relative_crawled_url: 'https:\/\/www.herault-data.fr\/explore\/dataset\/indice-de-la-qualite-de-lair-herault\/table\/', relative_found_on_url: '\/api\/external-urls?page=6' }],
        };
        const serializedPayload = JSON.stringify(payload);

        const signature = await generateOhDearSignature(serializedPayload);

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/ohdear/webhook',
          payload: serializedPayload,
          headers: { 'OhDear-Signature': signature },
        });

        // then
        expect(response.statusCode).toBe(200);
        const brokenUrlList = await knex('broken_urls').select('*');
        expect(brokenUrlList).toHaveLength(2);
      });
    });

    describe('when event is not supported', () => {
      it('returns a 400 status code', async () => {
        const payload = { type: 'unknown' };

        const serializedPayload = JSON.stringify(payload);

        const signature = await generateOhDearSignature(serializedPayload);

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/ohdear/webhook',
          payload: serializedPayload,
          headers: { 'OhDear-Signature': signature },
        });

        // then
        expect(response.statusCode).toBe(400);
      });
    });
  });
});

async function generateOhDearSignature(payload) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(config.urlBrokenLinksMonitor.webhookSecret),
    { name: 'HMAC', hash: { name: 'SHA-256' } },
    false,
    ['sign'],
  );
  const data = encoder.encode(payload);

  return Buffer.from(await crypto.subtle.sign('HMAC', key, data)).toString('base64');
}
