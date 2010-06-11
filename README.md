jQuery-Audiogram
=============

An html5 canvas script to display an editable audiogram in any modern browser (i.e. one that supports <canvas>)

How to use it
==========

You need a html table with the proper form with threshold data (see below).  All frequencies and transducers must be included.  The table should have an id of your patient's id number or MRN (or some other unique identifier).


Data table setup
============

The full thing can be found in the sample index.php file.

Here is an abbreviated sample:

	<table id="01496673">
		<thead>
			<tr>
				<th>Frequency</th>
				<th>Right Air Threshold</th>
				<th>Right Bone Threshold</th>
				<th>Left Air Threshold</th>
				<th>Left Bone Threshold</th>
				<th>Sound Field Unaided</th>
				<th>Sound Field Aided</th>
				<th>Cochlear Implant</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td>t250</td>
				<td>10</td>
				<td>5</td>
				<td>10</td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
			</tr>
			<tr>
				<td>t500</td>
				<td>15</td>
				<td>15</td>
				<td>20</td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
			</tr>
			// Snip to save space
			<tr>
				<td>t8k</td>
				<td>50</td>
				<td></td>
				<td>100</td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
			</tr>
			<tr>
				<td>t12k</td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
			</tr>
		</tbody>
	</table>

You need to include a couple of non-standard audiometric frequencies; it's just a small quirk of this program at present :
125, 180, 250, 375, 500, 750, 1k, 1.5k, 2k, 3k, 4k, 6k, 8k, 12k

Any point not plotted should have an empty value (i.e. <td></td>).  Otherwise, just insert the threshold.  Use -m for masking (e.g. 45 or 45-m)

Invoking the plugin
=============

jQuery is required (hence the name) and must be included in your html before the audiogram script.  After that, it's quite simple:

	$('#id_here').audiogram();

